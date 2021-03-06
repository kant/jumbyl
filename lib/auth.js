var fs = require('fs');
require('colors');
var path = require('path');
var request = require('request');
var Router = require('./router');
var url = require('url');
var openUrl = require('openurl').open;
var hogan = require("hogan.js");
var querystring = require('querystring');

var getConfig = require('./get-config').getConfig;

// -------------------------- helpers -------------------------- //

// log red error message
function logError( message ) {
  console.log( 'Error'.red.underline + ( ': ' + message ).red );
}

// displays the message template with content from another file
function displayPage( response, context ) {
  var html = messageCompiled.render( context );
  response.html( html );
}

// -------------------------- mustache templates -------------------------- //

// returns compiled hogan template
function getTemplate( fileName ) {
  var filePath = path.resolve( __dirname, '../views/' + fileName + '.mustache' );
  var template = fs.readFileSync( filePath, 'utf8' );
  return hogan.compile( template );
}

var messageCompiled = getTemplate('message');
var successCompiled = getTemplate('success');

// -------------------------- let's begin -------------------------- //

var configFile = '_jumbyl.yml';
var configFilePath = path.resolve( process.cwd(), configFile );

// local vars
var config, oauthToken, oauthSecret, router;


module.exports.auth = function authorize() {

  config = getConfig();

  if ( !config ) {
    logError( 'Config file "' + configFile +'" not found' );
    return;
  }

  if ( !config.consumer_key || !config.consumer_secret || !config.base_hostname ) {
    if ( !config.consumer_key ) {
      logError('Missing OAuth consumer_key from ' + configFile );
    }
    if ( !config.consumer_secret ) {
      logError('Missing OAuth consumer_secret from ' + configFile );
    }
    if ( !config.base_hostname ) {
      logError( 'Missing Tumblr blog base_hostname from ' + configFile );
    }
    return;
  }

  request({
    url: 'http://www.tumblr.com/oauth/request_token',
    oauth: config
  }, function( err, response, data ) {
    if ( err ) {
      logError( 'Unable to get OAuth request token. ' + err.data );
      process.exit(1);
      return;
    }
    var parsed = querystring.parse( data );

    oauthToken = parsed.oauth_token;
    oauthSecret = parsed.oauth_token_secret;

    // start server
    // simple server for OAuth dance
    router = new Router();
    router.get( '/complete', handleComplete );
    router.server.listen('8080');
    // open tumblr authorization URL in browser
    var tumblrUrl = 'http://www.tumblr.com/oauth/authorize?oauth_token=' + oauthToken;
    console.log( 'Redirecting for Tumblr OAuth authorization' + "\n  " + tumblrUrl );
    openUrl( tumblrUrl );
  });

};


function handleComplete( req, response ) {

  var query = url.parse( req.url, true ).query;
  var verifier = query && query.oauth_verifier;
  var pageContent, deniedFilePath;

  // no verifier, OAuth failed or was denied
  if ( !verifier ) {
    logError('OAuth denied');
    deniedFilePath = path.resolve( __dirname, '../views/oauth-denied.mustache' );
    pageContent = fs.readFileSync( deniedFilePath, 'utf8' );
    displayPage( response, {
      "yield": pageContent
    });
    // end page
    req.connection.destroy();
    router.server.close();
    process.exit(1);
    return;
  }

  var onOauthAccessGet = function( error, response2, data ) {
    if ( error ) {
      logError( 'Unable to get OAuth access. ' + error.data );
      process.exit(1);
      return;
    }
    // server confirmation page
    console.log( 'OAuth complete'.green );

    var parsed = querystring.parse( data );

    displayPage( response, {
      "yield": successCompiled.render({ path: configFile })
    });
    req.connection.destroy();
    router.server.close();
    onAuthComplete( parsed.oauth_token, parsed.oauth_token_secret );
  };

  request({
    url: 'http://www.tumblr.com/oauth/access_token',
    oauth: {
      consumer_key: config.consumer_key,
      consumer_secret: config.consumer_secret,
      token: oauthToken,
      token_secret: oauthSecret,
      verifier: verifier
    }
  }, onOauthAccessGet );

}

// write access keys to file
function onAuthComplete( accessToken, accessSecret ) {
  var content = 'base_hostname: ' + config.base_hostname + "\n" +
    'consumer_key: ' + config.consumer_key + "\n" +
    'consumer_secret: ' + config.consumer_secret + "\n" +
    'token: ' + accessToken + "\n" +
    'token_secret: ' + accessSecret  + "\n";
  fs.writeFile( configFilePath, content, 'utf8', function() {
    console.log('Tumblr keys updated');
    process.exit();
  });
}

