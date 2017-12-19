'use strict'

const koaPart = require('./../')
const koa = require('koa')
const koaRouter = require('koa-router')
const http = require('http')
const request = require('request-promise')
const fs = require('fs')
const path = require('path')

let app = new koa()
let router = new koaRouter()
let part = new koaPart(__dirname)

let errorHandle = async (ctx, next) => {
  try{
  	await next()
  }catch(e){
  	if(e.message.match('file not exists')){
      ctx.status = 404
    }else if (e.message.match('is not a media')){
      ctx.status = 406
    }
    ctx.body = e.stack
  }
}
router.get('/source/barroom.mp3', part.middleware())
router.get('/source/barroom1.mp3', part.middleware())
router.get('/source/test.html', part.middleware())
app.use(errorHandle)
app.use(router.routes())
let httpServer = http.createServer(app.callback())
httpServer.listen(8000, () => {
  console.log('http server is running at 8000')
})

describe('koaPart right answer test, return http code 206', () => {
  it('server 8000 is possible', async() => {
  	expect.assertions(1)
    let optionsTrue = {
	  uri: 'http://localhost:8000/source/barroom.mp3',
	  headers: {
	    Range: 'bytes=1000-'
	  },
	  resolveWithFullResponse: true
	}
	let res = await request(optionsTrue)
    let stat = fs.statSync(path.join(__dirname, '/source/barroom.mp3'))
	expect(res.headers['content-range'].match(stat.size).length > 0).toBe(true)
  })
})

describe('koaPart file not find test, return http code 500', () => {
  it('server 8000 is possible', async() => {
    expect.assertions(1)
    let optionsFalse = {
	  uri: 'http://localhost:8000/source/barroom1.mp3',
	  resolveWithFullResponse: true
    }
    try{
      let res = await request(optionsFalse)
    }catch(e){
      expect(e.statusCode === 404).toBe(true) 
    }
  })
})

describe('koaPart file request range is bigger than orgin range , return http code 416', () => {
  it('server 8000 is possible', async() => {
    expect.assertions(1)
    let stat = fs.statSync(path.join(__dirname, '/source/barroom.mp3'))
    let optionsFalse = {
	  uri: 'http://localhost:8000/source/barroom.mp3',
	  headers: {
	    Range: 'bytes=0-' + (stat.size + 1)
	  },
	  resolveWithFullResponse: true
    }
    try{
      let res = await request(optionsFalse)
    }catch(e){
      expect(e.statusCode === 416).toBe(true) 
    }
  })
})

describe('koaPart file is not a media file, return http code 406', () => {
  it('server 8000 is possible', async() => {
    expect.assertions(1)
    let optionsFalse = {
	  uri: 'http://localhost:8000/source/test.html',
	  resolveWithFullResponse: true
    }
    try{
      let res = await request(optionsFalse)
    }catch(e){
      expect(e.statusCode === 406).toBe(true) 
    }
  })
})
