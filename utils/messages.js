const moment = require('moment');

function formatMessage(username, text){
    return{
        username: username,
        text: text,
        time: moment().format(' DD MMM YYYY hh:mm:ss a')
    }
}

module.exports = formatMessage;