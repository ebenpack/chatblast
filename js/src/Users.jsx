var React = require('react');
var util = require('./util');

var Users = React.createClass({
    render: function(){
        return (
            <div className={this.props.className + ' six columns'} >
                {this.props.users.map(function(user){
                    return (<div>User {user.name}, connected at {util.convertFromEpoch(user.connected)}</div>);
                })}
            </div>
        );
    }
});

module.exports = Users;