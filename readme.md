## koa-partial-content
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Build Status](https://travis-ci.org/xtx1130/koa-partial-content.svg?branch=master)](https://travis-ci.org/xtx1130/koa-partial-content) [![Coverage Status](https://coveralls.io/repos/github/xtx1130/koa-partial-content/badge.svg?branch=master)](https://coveralls.io/github/xtx1130/koa-partial-content?branch=master) 
>  This package makes media type(mp3|mp4|flv|webm|ogv|mpg|mpg|wav|ogg) response http status code 206

### Usage
- install:
```shell
$ npm install koa koa-router koa-partial-content
```
- use with koa-router:
```js
'use strict'

const koa = require('koa')
const koaRouter = require('koa-router')
const koaPart = require('koa-partial-content')

let app = new koa()
let router = new koaRouter()
let part = new koaPart(__dirname)//your server base path,defalut is process.cwd()

router.get('/source/barroom.mp3', part.middleware())//when barroom.mmp3 is requested, it will response http status code 206
app.use(router.routes())
```
- http status code:
  -  206: partial content  
  -  416: request range is more than file size
  -  other error will throw a new Error,you need to use error handle to catch them, for more information please see: [test case](https://github.com/xtx1130/koa-partial-content)