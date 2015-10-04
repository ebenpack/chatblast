var React = require('react');
var Connect = require('./Connect.jsx');

var Commands = React.createClass({
    render: function() {
        return (
            <div>
                <Connect className={this.props.connectClass} readyState={this.props.readyState} />
            </div>

        );
    }
});

module.exports = Commands;