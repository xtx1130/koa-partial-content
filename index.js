'use strict'

const mt = require('mime-types')
const fs = require('fs')
const path = require('path')

class KoaPartial {
  constructor(basePath){
    this.basePath = basePath || process.cwd()
  }
  isMedia(filePath) {
  	let matches = filePath.match(/\.(mp3|mp4|flv|webm|ogv|mpg|mpg|wav|ogg)$/ig)
  	return matches ? true : false
  }
  writeFileStream(ctx, start, end, filePath, stat) {

    return new Promise((resolve, reject) => {
      let stream = void 0
      if(!isMedia(filePath)){
    	let err = new Error('This path is not a media')
      	reject(err)
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
    let range = ctx.request.header['range'] || 'bytes=0-'
  	let bytes = range.split('=').pop().split('-')
    let fileStart = Number(bytes[0])
    let fileEnd = Number(bytes[1]) || stat.size - 1
    let contentType = mt.lookup(ctx.path)
    let absolutePath = path.join(this.basePath, ctx.path)
    let stat = fs.statSync(absolutePath)
    
    ctx.status = 206
    ctx.type = contentType
    ctx.set('Accept-Ranges', 'bytes')
    ctx.set('Content-Range', `bytes ${fileStart}-${fileEnd}/${stat.size}`)
    await writeFileStream(ctx, fileStart, fileEnd, absolutePath, stat)
  }
  middleWare() {
  	let dispatch = async (ctx, next) => {

  	}
  	return dispatch 
  }
}