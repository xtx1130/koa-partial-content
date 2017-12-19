'use strict'

const mt = require('mime-types')
const fs = require('fs')
const path = require('path')

const basePath = Symbol.for('project base path')

class KoaPartial {
  constructor(projectPath){
    this[basePath] = projectPath || process.cwd()
  }
  isMedia(filePath) {
  	let matches = filePath.match(/\.(mp3|mp4|flv|webm|ogv|mpg|mpg|wav|ogg)$/ig)
  	return matches ? true : false
  }
  writeFileStream(ctx, start, end, filePath, stat) {

    return new Promise((resolve, reject) => {
      let stream = void 0
      if(!this.isMedia(filePath)){
    	let err = new Error('This path is not a media')
      	reject(err)
      	return false
      }
      if(stat.isFile()){
        stream = fs.createReadStream(filePath, {start: start, end: end})
        stream.on('open', length => {
          stream.pipe(ctx.res)
        })
        stream.on('error', err => {
          reject(err)
        })
        stream.on('end', () => {
          resolve('success')
        })
      } else {
      	let err = new Error('This path is not a filepath')
      	reject(err)
      }
    })
  }
  async sendResponse(ctx) {
  	let absolutePath = path.join(this[basePath], ctx.path)
  	let stat = void 0
  	try{
  	  stat = fs.statSync(absolutePath)
  	}catch(e){
  	  throw new Error(`${absolutePath} file not exists`)
  	}
    let range = ctx.request.header['range'] || 'bytes=0-'
  	let bytes = range.split('=').pop().split('-')
    let fileStart = Number(bytes[0])
    let fileEnd = Number(bytes[1]) || stat.size - 1
    let contentType = mt.lookup(ctx.path)
    ctx.type = contentType
    ctx.set('Accept-Ranges', 'bytes')
    if(fileEnd > stat.size - 1 || fileStart > stat.size - 1){
      ctx.status = 416
      ctx.set('Content-Range', `bytes ${stat.size}`)
      ctx.body = 'Requested Range Not Satisfiable'
    }else{
      ctx.status = 206
      ctx.set('Content-Range', `bytes ${fileStart}-${fileEnd}/${stat.size}`)
      try{
        await this.writeFileStream(ctx, fileStart, fileEnd, absolutePath, stat)
      }catch(e){
      	throw new Error(e)
      }
    }
  }
  middleware() {
  	let dispatch = async (ctx, next) => {
      try{
        await this.sendResponse(ctx)
  	  } catch(e) {
        throw new Error(e)
      }
  	}
  	return dispatch 
  }
}

exports = module.exports = KoaPartial