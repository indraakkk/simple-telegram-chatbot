'use strict'

const apiai = require('apiai')
const uuid = require('node-uuid')
const request = require('request')

module.exports = class TelegramBot{

    get apiaiService() {
        return this._apiaiService
    }

    set apiaiService(value) {
        this._apiaiService = value
    }

    get botConfig(){
        return this._botConfig
    }

    set botConfig(value) {
        this._botConfig = value
    }

    get sessionIds() {
        return this._sessionIds
    }

    set sessionIds(value) {
        this._sessionIds = value
    }

    constructor(botConfig, baseUrl) {
        this._botConfig = botConfig
        var apiaiOptions = {
            language: botConfig.apiaiLang,
            requestSource: "telegram"
        }

        this._apiaiService = apiai(botConfig.apiaiAccessToken, apiaiOptions)
        this._sessionIds = new Map()

        this._webhookUrl = baseUrl + '/webhook'
        console.log('starting bot on' + this._webhookUrl)

        this._telegramApiUrl = 'https://api.telegram.org/bot' + botConfig.telegramToken
    }

    start(responseCallback, errCallback){
        request.post(this._telegramApiUrl + '/setWebhook', {
            json: {
                url: this._webhookUrl
            }
        }, (error, response, body)=> {
            if(error) {
                console.error('Error while /setWebhook', error)
                if(errCallback) {
                    errCallback(error)
                }
                return
            }

            if(response.statusCode !=200) {
                console.error('Error status code while /setwebhook', body)
                if(errCallback) {
                    errCallback(`Error status code while setWebhook ${body}`)
                }
                return
            }

            console.log('Method /setWebhook completed', body)
            if(responseCallback){
                responseCallback(`Method /setWebhook completed ${body}`)
            }
        })
    }

    processMessage(req, res){
        if(this._botConfig.devConfig) {
            console.log('body', req.body)
        }

        let updateObject = req.body

        if(updateObject && updateObject.message) {
            let msg = updateObject.message

            var chatId

            if(msg.chatId){
                chatId = msg.chat.id
            }

            let messageText = msg.text

            console.log(chatId, messageText);

            if(chatId && messageText) {
                if(!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1())
                }

                let apiaiRequest = this._apiaiService.textRequest(messageText,
                    {
                        sessionIds: this._sessionIds.get(chatId)
                    })
                apiaiRequest.on('response', (response)=> {
                    if(TelegramBot.isDefined(response.result)){
                        let responseText = response.result.fullfilment.speech
                        let responseData = response.result.fullfilment.responseData

                        if(TelegramBot.isDefined(responseData) && TelegramBot.isDefined(response.telegram)){
                            console.log('Response as formatted message');

                            let telegramMessage = responseData.telegram
                            telegramMessage.chat_id = chatId

                            this.reply(telegramMessage)
                            TelegramBot.createResponse(res, 200, 'Message proceed')
                            
                        } else if (TelegramBot.isDefined(responseText)){
                            console.log('Response as text message');
                            this.reply({
                                chat_id: chatId,
                                text: responseText
                            })
                            TelegramBot.createResponse(res, 200, 'Message proceed')
                            
                        } else {
                            console.log('Received empty speech');
                            TelegramBot.createResponse(res, 200, 'Received empty speech')
                        }
                    } else {
                        console.log('Received empty result');
                        TelegramBot.createResponse(res, 200, 'Received empty result')
                    }
                })

                apiaiRequest.on('error', (error)=> {
                    console.error('Error while call to api.ai', error);
                    TelegramBot.createResponse(res, 200, 'Error while call to api.ai')
                })
                apiaiRequest.end()
            } else {
                console.log('Empty message');
                return TelegramBot.createResponse(res, 200, 'Empty message')
            }
        } else {
            console.log('Empty message');
            return TelegramBot.createResponse(res, 200, 'Empty message')
        }
    }

    reply(msg) {
        request.post(this._telegramApiUrl + '/sendMessage', {
            json: msg
        }, (error, response, body)=> {
            if(error){
                console.log('Error while /sendMessage', error);
                return
            }

            if(response.statusCode != 200){
                console.error('Error status code while /sendMessage', body);
                return
            }

            console.log('Method /sendMessage succeded');
        })
    }

    static createResponse(resp, code, message) {
        return resp.status(code).json({
            status: {
                code: code,
                message: message
            }
        })
    }

    static isDefined(obj){
        if(typeof obj == 'undefined') {
            return false
        }

        if(!obj){
            return false
        }

        return obj != null
    }

}