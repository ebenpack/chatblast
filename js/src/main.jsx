var React = require('react');
var Store = require('./Store');
var Chatblast = require('./Chatblast.jsx');

function init(domain) {
    React.render(
        <Chatblast domain={domain} />,
        document.getElementById('app')
    );
}

exports.init = init;