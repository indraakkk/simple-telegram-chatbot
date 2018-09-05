const axios = require("axios");

require("dotenv").config();

const DIALOGFLOW_API_URL = process.env.DIALOGFLOW_API_URL;
const DIALOGFLOW_CLIENT_TOKEN = process.env.DIALOGFLOW_CLIENT_TOKEN;

const AuthStr = "Bearer ".concat(DIALOGFLOW_CLIENT_TOKEN);

module.exports = {
  get_reply: (chat, callback) => {
    axios
      .get(
        `https://api.dialogflow.com/v1/query?v=20150910&lang=en&sessionId=12345&query=${chat}`,
        { headers: { Authorization: AuthStr } }
      )
      .then(response => callback(null, response.data.result.fulfillment.speech))
      .catch(error => callback(error, null));
  }
};
