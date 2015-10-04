function convertFromEpoch(timestamp) {
    var d = new Date(0),
        dateString;
    d.setUTCSeconds(timestamp).toString();
    return d.toLocaleTimeString();
}

function debounce(fn, timeout){
    var lastCalled,
        timeoutId;
    return function() {
        lastCalled = Date.now();
        var context = this;
        function debounced(){
            var now = Date.now();
            var elapsed = now - lastCalled;
            if (elapsed > timeout){
                fn.apply(context, arguments);
            } else {
                timeoutId = setTimeout(debounced, elapsed);
            }
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(debounced, timeout);
    };
}

exports.convertFromEpoch = convertFromEpoch;
exports.debounce = debounce;