'use strict'

module.exports = (Datenow = null) => {
  let date
  if (Datenow === null) {
    date = new Date()
  } else {
    date = new Date(Datenow)
  }
  const HH = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  const SSS = String(date.getMilliseconds()).padStart(3, '0')

  const DD = String(date.getDate()).padStart(2, '0')
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const YYYY = date.getFullYear()
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}.${SSS}`
}
