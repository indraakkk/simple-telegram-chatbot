'use strict'

const apiai = require('apiai')
const express = require ('express')
const bodyParser = require('body-parser')

const TelegramBot = require('./telegram/telegrambot')
const TelegramBotConfig = require('./telegram/telegrambotconfig')

require('dotenv').config()

const REST_PORT = (process.env.PORT || 5000)
const DEV_CONFIG = process.env.DEVELOPMENT_CONFIG == 'true'

const APP_NAME = process.env.APP_NAME
const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN
const APIAI_LANG = process.env.APIAI_LANG
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

var baseUrl = ''
if (APP_NAME){
  baseUrl = `https://${APP_NAME}.herokuapp.com`
} else {
  console.error('Set up your heroku app first')
  process.exit(1)
}

require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l')

const botConfig = new TelegramBotConfig(
  APIAI_ACCESS_TOKEN,
  APIAI_LANG,
  TELEGRAM_TOKEN)

botConfig.devConfig = DEV_CONFIG

const bot = new TelegramBot(botConfig, baseUrl)
bot.start(()=> {
  console.log('Bot Running')
},
(errStatus)=> {
  console.error('Check your telegram token')
})

const app = express()

app.use(bodyParser.json())

app.post('/webhook', (req, res)=> {
  console.log('POST webhook');
  
  try {
    bot.processMessage(req, res)
  } catch (err) {
    return res.status(400).send(
      'Error while processing ' + err.message
    )
  }
})

app.listen(REST_PORT, ()=> {
  console.log('REST Servce running on port:' + REST_PORT);
  
})