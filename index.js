// process.env.NTBA_FIX_319 = 1;

const Telegram = require('node-telegram-bot-api')
const dbot = require('dbot-js')
require('dotenv').config()

const token = process.env.TELEGRAM_TOKEN
const mondayCoolBot = new Telegram(token, {polling: true})

mondayCoolBot.on('message', (msg)=> {
  var chatId = msg.chat.id
  var message = msg.text.toString()

dbot.get_response(message, (err, res)=> {
    if(!err){
        mondayCoolBot.sendMessage(chatId, res)
    }
  })
})