const { exec } = require('child_process')
const sensor = require('node-dht-sensor').promises
const WebSocketClient = require('./WebSocketClient')
const FormatDate = require('./FormatDate')

const { readFileSync } = require('fs')
const data = JSON.parse(readFileSync('config', 'utf8'))

const wsc = new WebSocketClient('wss://smarthome.spddl.de/')
const interval = 10
let lastConnect = 0
let lastDisconnect = 0

wsc.onopen = () => {
  lastConnect = new Date()
  wsc.send(JSON.stringify({ type: 'rpizero', value: { lastConnect, lastDisconnect, lastConnectFormat: FormatDate(lastConnect), lastDisconnectFormat: FormatDate(lastDisconnect) } }))
}
wsc.onclose = () => {
  lastDisconnect = new Date()
}

const execPromise = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr })
    })
  })
}

// LOOP
setInterval(async () => {
  Promise.all([
    execPromise("awk 'NR==3 {print $3}' /proc/net/wireless"),
    sensor.read(22, 4)
  ])
    .then(values => {
      const wLan = Number(values[0].stdout)
      const sensor = values[1]
      const time = +Date.now()
      // console.log(FormatDate(), `wLanStrength: ${wLan}%, time: ${time}%, temp: ${sensor.temperature.toFixed(1)}°C, humidity: ${sensor.humidity.toFixed(1)}%`)
      wsc.send(JSON.stringify({ type: 'rpizero', value: { wLan, time, roomid: data.id, temp: sensor.temperature.toFixed(1), humidity: sensor.humidity.toFixed(1) } }))
    }).catch(reason => {
      console.warn(FormatDate(), reason)
    })
}, interval * 1000)
