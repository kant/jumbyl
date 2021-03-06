# jumbyl

Post to Tumblr with static files, like [Jekyll](http://github.com/mojombo/jekyll)

## Install

``` bash
npm install jumbyl -g
```

Jumbyl is a command-line tool. Installing it globally will add the `jumbyl` command.

## Setup

+ Go to [**www.tumblr.com/oauth/apps**](http://www.tumblr.com/oauth/apps)
+ Click **+ Register application**

Use these values for the jumbyl application. You can leave all the others blank.

<table>
  <tr><th>Application Name:</th><td>jumbyl</td></tr>
  <tr><th>Administrative contact email:</th><td>your@email.com</td></tr>
  <tr><th>Default callback URL:</th><td>http://localhost:8080/complete</td></tr>
</table>

### _jumbyl.yml

Once you **Save changes**, you'll need to create a new config file `_jumbyl.yml` in your local project folder. Set `base_hostname` and copy the **OAuth consumer key** and **OAuth consumer secret** into `_jumbyl.yml`.

``` yaml
# these keys will not work, copy/paste in your own
base_hostname: your_blog.tumblr.com # or your_blog.com
consumer_key: UveNAMmenYF1Zivd6ahUJWKNy2gHl6PC9lMthT7mwjT8Ujf2NV
consumer_secret: dLfg7DB2ZU5eVx3xyL3DltxtOBchmvQReBIn9HYB3GmXsgYLaQ
```

_Probably a good idea to add `_jumbyl.yml` to `.gitignore`._

From the command line, navigate to your local project folder and authorize

``` bash
jumbyl auth
```

Once authorized, you can now post to your Tumblr.

## Post

To post to Tumblr, specify a file with `jumbyl`

``` bash
jumbyl _posts/my-post.md
```

After successfully posting, jumbyl will add the tumblr post `id` to the file's YAML Front Matter.

To edit a post, the file will need an `id` parameter, so you can use the same command.

## Parameters

[Parameters for your Tumblr post](http://www.tumblr.com/docs/en/api/v2#posting) can be set with YAML Front Matter.

Here's a text post:

    ---
    title: Favorite Ninja Turtles
    tags: [ turtles, ninjas, probably Leonardo ]
    format: markdown
    ---
    + **Leonardo** duh
    + Sometimes _Raphael_, when's he's not emo

Here's a link post:

    ---
    title: TMNTPedia
    type: link
    tags: [ knowledge, wiki ]
    url: http://tmnt.wikia.com/
    ---
    Seriously, get schooled.

The content of the post will be set to the appropriate parameter for the type of post.

<table>
  <tr><th>text</th><td>body</td></tr>
  <tr><th>link</th><td>description</td></tr>
  <tr><th>chat</th><td>conversation</td></tr>
  <tr><th>quote</th><td>quote</td></tr>
  <tr><th>photo</th><td>caption</td></tr>
  <tr><th>audio</th><td>caption</td></tr>
  <tr><th>video</th><td>caption</td></tr>
</table>

Additionally, the format of the post will be read from the post's file extention. Posts that use `.markdown` `.md` `.mkdn` `.mdown`, will be set as `format: 'markdown'`.

## Jekyll

Jumbyl pairs up nicely with Jekyll.

For link posts, you can use `_url` in the YAML Front Matter, so it does not conflict with [Jekyll's template data](https://github.com/mojombo/jekyll/wiki/Template-Data) like `post.url`.

    ---
    title: TMNTPedia
    type: link
    # _url, so no clonflict with Jekyll's post.url
    _url: http://tmnt.wikia.com/
    ---
    Seriously, get schooled.
