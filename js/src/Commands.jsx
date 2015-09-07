var React = require('react');
var Reflux = require('reflux');
var Store = require('./Store');
var Actions = require('./Actions');
var Connect = require('./Connect.jsx');


var Chatblast = React.createClass({
    render: function() {
        if (this.props.readyState !== 1) {
            return (
                <div>
                    <Connect className={this.props.connectClass} readyState={this.props.readyState} />
                </div>

            );
        } else {
            return (<div></div>);
        }
    }
});

module.exports = Chatblast;