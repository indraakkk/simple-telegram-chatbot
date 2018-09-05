const dialogflow = require("./instance/axiosinstance");

const Reply = dialogflow.get_reply("you are bad", (error, response) => {
  error ? console.log(error) : console.log(response);
});
