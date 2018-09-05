const events = require('events')
const chalk = require('chalk')
const log = console.log
class Events extends events.EventEmitter {
  constructor () {
    super()
  }
}

var myEvents = new Events()
myEvents.setMaxListeners(1000)
myEvents.on('warn' ,(playload) => {
  log(chalk.yellow(`[translate-warn]:\n ${playload}`))
})

myEvents.on('error', (playload) => {
  for (let i in playload) {
    log((chalk.red(`[translate-error]:    ${i} : ${playload[i]}`)))
  }

})
myEvents.on('start', () => {
  log(chalk.green('转译开始.......'))
})
myEvents.on('end', () => {
  log(chalk.green('转译完成'))
})

myEvents.on('finish', (playload) => {
  playload.forEach(e => {
    if (e.ignore === true) {
      log(chalk.yellow(`ignore: ${e.src} --> ${e.dist}`))

    } else {
      if (e.success === true) {
        log(chalk.green(`success: [${e.src}] --> [${e.dist}]`))
      }
      if (e.fial === true) {
        log(chalk.red(`fail: [${e.src}] --> [${e.dist}]`))
      }
    }
  })
})
module.exports = myEvents