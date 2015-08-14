var React = require('react');
var Chatblast = require('./Chatblast.jsx');

function init(state){
    React.render(
      <Chatblast data={state} />,
      document.getElementById('app')
    );
}

exports.init = init;
