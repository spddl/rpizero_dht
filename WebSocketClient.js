const WebSocket = require('ws')
const FormatDate = require('./FormatDate')

function WebSocketClient (url) {
  let client
  let timeout
  let timeoutPing
  let connecting = false
  let backoff = 250
  const init = () => {
    console.error(FormatDate(), 'WebSocketClient :: connecting')
    connecting = false
    if (client !== undefined) {
      client.removeAllListeners()
    }
    client = new WebSocket(url)
    const heartbeat = () => {
      clearTimeout(timeoutPing)
      timeoutPing = setInterval(() => {
        if (client.readyState === 1) {
          client.send('PING')
        } else {
          console.log(FormatDate(), `WebSocketClient :: NOT SEND: client.ping()`)
        }
      }, 15000)

      clearTimeout(timeout)
      timeout = setTimeout(() => client.terminate(), 35000)
    }

    client.on('open', (e) => {
      if (typeof this.onopen === 'function') {
        this.onopen()
      } else {
        console.log(FormatDate(), 'WebSocketClient :: opened')
      }
      heartbeat()
    })
    client.on('message', (e) => {
      // if (typeof this.onmessage === 'function') {
      //   this.onmessage(e)
      // } else {
      //   console.log(FormatDate(), 'WebSocketClient :: messaged')
      // }
      heartbeat()
    })
    client.on('close', (e) => {
      if (e.code !== 1000) {
        if (connecting === false) { // abnormal closure
          backoff = backoff === 8000 ? 250 : backoff * 2
          setTimeout(() => init(), backoff)
          connecting = true
        }
      } else if (typeof this.onclose === 'function') {
        this.onclose()
      } else {
        console.error(FormatDate(), 'WebSocketClient :: closed', JSON.stringify(e))
      }
    })
    client.on('error', (e) => {
      if (e.code === 'ECONREFUSED') {
        if (connecting === false) { // abnormal closure
          backoff = backoff === 8000 ? 250 : backoff * 2
          setTimeout(() => init(), backoff)
          connecting = true
        }
      } else if (typeof this.onerror === 'function') {
        this.onerror(e)
      } else {
        console.error(FormatDate(), 'WebSocketClient :: errored', JSON.stringify(e))
      }
    })

    this.send = (data) => {
      if (client.readyState === 1) {
        // console.log(`SEND: ${data}`)
        client.send(data)
      } else {
        console.log(FormatDate(), `WebSocketClient :: NOT SEND: ${data}`)
      }
    }
  }
  init()
}

module.exports = WebSocketClient
