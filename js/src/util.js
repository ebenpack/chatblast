function convertFromEpoch(timestamp){
    var d = new Date(0),
        dateString;
    d.setUTCSeconds(timestamp).toString();
    return d.toLocaleTimeString();
}

exports.convertFromEpoch = convertFromEpoch;