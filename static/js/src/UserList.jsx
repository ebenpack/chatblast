var React = require('react');
var util = require('./util');
var User = require('./User.jsx');

var UserList = React.createClass({
    render: function() {
        var users = this.props.users;
        var showConnected = this.props.showConnected;
        var filterUsers = this.props.filterUsers || function(user){return true;};
        return (
            <ul>
            {Object.keys(users).
                filter(filterUsers).
                sort(function(a, b){
                    return users[a].name > users[b].name;
                }).map(function(uid){
                    var blocked = this.props.blocked.hasOwnProperty(uid);
                    return (
                        <User
                            key={users[uid].id}
                            onClick={this.props.onClick}
                            extras={this.props.extras}
                            user={users[uid]}
                            showConnected={this.props.showConnected}
                            handleConnectedClick={this.props.handleConnectedClick}
                            blocked={blocked}
                        />
                    );
                }, this)
            }
            </ul>
        );
    }
});

module.exports = UserList;

