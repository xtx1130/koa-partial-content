'use strict'

const koaPart = require('./../')
const koa = require('koa')
const koaRouter = require('koa-router')
const http = require('http')

let app = new koa()
let router = new koaRouter()

app.use(router.routes())
let httpServer = http.createServer(app.callback())
httpServer.listen(8000, () => {
  console.log('http server is running at 8000')
})