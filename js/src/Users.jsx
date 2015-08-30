var React = require('react');
var util = require('./util');

var Users = React.createClass({
    render: function(){
        var users = this.props.users;
        return (
            <div className={this.props.className} >
                <h4>Users</h4>
                {Object.keys(users).
                    sort(function(a, b){
                        return users[a].name < users[b].name;
                    }).map(function(uid){
                        var user = users[uid];
                        return (<div key={user.connected}>{user.name}, connected at {util.convertFromEpoch(user.connected)}</div>);
                    })
                }
            </div>
        );
    }
});

module.exports = Users;