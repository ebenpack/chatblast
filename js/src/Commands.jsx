var React = require('react');
var Reflux = require('reflux');
var Store = require('./Store');
var Actions = require('./Actions');
var Connect = require('./Connect.jsx');


var Chatblast = React.createClass({
    render: function() {
        return (
            <div>
                <Connect className={this.props.connectClass} readyState={this.props.readyState} />
            </div>
            
        );
  }
});

module.exports = Chatblast;

