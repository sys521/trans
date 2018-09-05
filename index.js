const path = require('path')
const fse = require('fs-extra')
const fs = require('fs')
const convert = require('chinese_convert')

let MyTransformStream = require('./lib/transform-stream')
const myEvents = require('./lib/event')

function isDir (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err)
        return
      }
      if (!stats) {
        reject(err)
        return
      }
      if (stats.isFile()) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
//  创建文件
function translateFunc (word) {
  if (this.dict.hasOwnProperty(word)) {
    return dict[word]
  } else {
    return convert.cn2tw(word)
  }
}


class Translate {
  constructor (config) {
    // 读取config
    this.dist = config.dist
    this.source = config.source
    this.exclude = config.exclude
    this.dict = config.dict
    this.translateFunc = this.translateFunc.bind(this)
    // 文件信息存放
    this.fileListPath = []
    // defaultExclude
    this.defalutdefalutExclude = ['.jpg', '.png', '.gif', '.xls', '.svg', '.css', '.less', '.sass', '.scss']
    // 错误信息
    this.fail = []
    this.success = []
    // start
    this.startTime = new Date()
    myEvents.emit('start')
    console.time('translate')
    this.run().then(() => {
      myEvents.emit('finish', this.success.concat(this.fail))
      myEvents.emit('end', `${new Date() - this.startTime} ms`)
      console.timeEnd('translate')
    }).catch(err => {
      myEvents.emit('finish', this.success.concat(this.fail))
      myEvents.emit('end', `${new Date() - this.startTime} ms`)
      console.timeEnd('translate')
    })

  }
  // 获取该文件下的文件信息
  getDirInfo (filePath, exclude, ignore = false) {
    return fse.readdir(filePath).then(res => {
      return Promise.all(res.map(e => {
        let file = path.join(filePath, e)
        return isDir(file).then(res => {
          if (res === false) {
            let ignoreDir
            ignore ? ignoreDir = true : ignoreDir = this.isExclude(file, exclude.dir)
            return this.getDirInfo(file, exclude, ignoreDir)
          } else {
            let ignoreFile
            ignore ? ignoreFile = true : ignoreFile = this.isExclude(file, exclude.dir)
            return this.fileListPath.push({
              src: file,
              dist: '',
              ignore: ignoreFile
            })
          }
        }).catch(err => {
          console.log(err)
          console.log('读取文件错误')
        })
      }))
    })
  }
  // 源文件获取文件
  getFileList () {
    return this.getDirInfo(this.source, this.exclude).then(() => {
      this.fileListPath.forEach(e => {
        let relative = path.relative(this.source, e.src)
        e.dist = path.join(this.dist, relative)
      })
    }).catch(err => {
      console.log(err)
      myEvents.emit('error', Object.assign({msg: `获取源文件 ${this.source} 失败`}, err))
    })
  }
  // 文件是否被包含进排除文件中
  isExclude (src, exclude) {
    let excludeArr = this.defalutdefalutExclude.concat(exclude)
    let isExclude = false
    excludeArr.forEach(filePath => {
      if (!path.relative(filePath, src)) {
        isExclude = true
      }
      if (filePath === path.parse(src)['ext']) {
        isExclude = true
      }
    })
    return isExclude
  }
  // 创建拷贝文件
  createCopy (src, dist) {
    return fse.copy(src, dist)
      .then(() => {
        return 'success'
      }).catch(err => {
        myEvents.emit('error', Object.assign({
          msg: `拷贝文件失败: ${src}`
        }, err))
      })
  }

  // translateFunc
  translateFunc (word) {
    if (this.dict.hasOwnProperty(word)) {
      return this.dict[word]
    } else {
      return convert.cn2tw(word)
    }
  }
  // 判断目标文件是否存在

  run () {
    return isDir(this.source).then(() => {
      return this.getFileList().then(() => {
        return Promise.all(this.fileListPath.map(e => {
          return this.createCopy(e.src, e.dist).then(res => {
            return new Promise((resolve, reject) => {
              if (res === 'success') {
                let read = fs.createReadStream(e.src)
                let write = fs.createWriteStream(e.dist)
                console.log(e.dist)
                let translateForm = new MyTransformStream({
                  translateFunc: this.translateFunc
                })
                write.on('error', (err) => {
                  this.fail.push({
                    src: e.src,
                    dist: e.dist,
                    fail: true
                  })
                  reject(err)
                })
                write.on('finish', (err) => {
                  if (err) {
                    reject(err)
                    this.fail.push({
                      src: e.src,
                      dist: e.dist,
                      ignore: e.ignore,
                      fail: true
                    })
                  } else {
                    this.success.push({
                      src: e.src,
                      dist: e.dist,
                      success: true,
                      ignore: e.ignore
                    })
                    resolve()
                  }
                })
                if (!e.ignore) {
                  read.pipe(translateForm).pipe(write)
                } else {
                  read.pipe(write)
                }
              }
            })
          })
        }))
      })
    }).catch(err => {
      let msg = '当前文件下没有找到 "src" 文件'
      console.log(err)
      let playload = Object.assign(err, {msg})
      myEvents.emit('error', playload)
    })
  }
}

module.exports = Translate


