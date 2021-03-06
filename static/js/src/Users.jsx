var React = require('react');
var UserList = require('./UserList.jsx');
var Actions = require('./Actions');

var Users = React.createClass({
    handleConnectedClick: function(e, user){
        if (this.props.readyState === 1) {
            Actions.toggleUserBlock(user);
        }
    },
    render: function() {
        var context = this;
        return (
            <div className={this.props.className} >
                <h4>Users</h4>
                <UserList
                    showConnected={true}
                    users={this.props.users}
                    self={this.props.self}
                    blocked={this.props.blocked}
                    handleConnectedClick={this.handleConnectedClick}
                />
            </div>
        );
    }
});

module.exports = Users;