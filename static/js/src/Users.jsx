var React = require('react');
var UserList = require('./UserList.jsx');

var Users = React.createClass({
    render: function() {
        return (
            <div className={this.props.className} >
                <h4>Users</h4>
                <UserList users={this.props.users} showConnected={true} />
            </div>
        );
    }
});

module.exports = Users;