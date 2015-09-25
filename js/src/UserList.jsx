var React = require('react');
var util = require('./util');
var User = require('./User.jsx');

var UserList = React.createClass({
    render: function() {
        var users = this.props.users;
        var showConnected = this.props.showConnected;
        return (
            <ul>
            {Object.keys(users).
                sort(function(a, b){
                    return users[a].name < users[b].name;
                }).map(function(uid){
                    return (<User key={users[uid].id} onClick={this.props.onClick} showConnected={showConnected} user={users[uid]} />);
                }, this)
            }
            </ul>
        );
    }
});

module.exports = UserList;

