require("dotenv").config();

const Telegram = require("node-telegram-bot-api");
const Reply = require("./instance/axiosinstance");

const token = "610046122:AAEP1nsQPUf9u_MhYdVczum4Z4P5r8waHnU";
const mondayCoolBot = new Telegram(token, { polling: true });

mondayCoolBot.on("message", chat => {
  var chatId = chat.chat.id;
  var message = chat.text.toString();

  Reply.get_reply(message, (err, res) => {
    if (!err) {
      mondayCoolBot.sendMessage(chatId, res);
    }
  });
});
