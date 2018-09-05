// 创建一个转换流
var stream = require('stream')
class MyTransformStream extends stream.Transform {
  constructor(options) {
    super(options)
    this.lastLine = ''
    this.translateFunc = options.translateFunc
  }
  _transform(chunk, encoding, done) {
    let data = chunk.toString()
    let newData = data.replace(/[\u4e00-\u9fa5]+/g, (word) => {
      return this.translateFunc(word)
    })
    this.push(newData)
    done()
  }
}

module.exports = MyTransformStream