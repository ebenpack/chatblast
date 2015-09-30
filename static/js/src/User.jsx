var React = require('react');
var util = require('./util');

var User = React.createClass({
    handleClick: function(e){
        if (this.props.onClick) {
            this.props.onClick.call(this, e, this.props.user);
        }
    },
    handleConnectedClick: function(e){
        if (this.props.handleConnectedClick) {
            this.props.handleConnectedClick.call(this, e, this.props.user);
        }
    },
    render: function() {
        var user = this.props.user;
        var extras = '';
        if (this.props.showConnected) {
            var blockedText = ' | ' + (this.props.blocked ? 'Unblock' : 'Block');
            extras = (
                <span>, connected at {util.convertFromEpoch(user.connected)} <span onClick={this.handleConnectedClick}>{blockedText}</span></span>
            );
        }
        return (<li onClick={this.handleClick}>{user.name}{extras}</li>);
    }
});

module.exports = User;

