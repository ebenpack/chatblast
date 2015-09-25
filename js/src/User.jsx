var React = require('react');
var util = require('./util');

var User = React.createClass({
    handleClick: function(e){
        if (this.props.onClick) {
            this.props.onClick.call(this, e, this.props.user);
        }
    },
    render: function() {
        var user = this.props.user;
        var userString = user.name;
        if (this.props.showConnected) {
            userString += ', connected at ' + util.convertFromEpoch(user.connected);
        }
        return (<li onClick={this.handleClick}>{userString}</li>);
    }
});

module.exports = User;

