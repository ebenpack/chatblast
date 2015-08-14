var React = require('react');
var Chatlog = require('./Chatlog.jsx');
var Connect = require('./Connect.jsx');
var Users = require('./Users.jsx');

var Chatblast = React.createClass({
  render: function() {
    var connectClass = 'connect',
        chatClass = 'chat',
        userClass = 'user';
    if (this.props.data.readyState === 0) {
        connectClass += " focus";
        chatClass += " blur";
        userClass += " blur";
    } else if (this.props.data.readyState === 1) {
        chatClass += " focus";
        userClass += " focus";
        connectClass += " blur";
    }
    return (
      <div className="chatblast">
        <Chatlog className={chatClass} chatlog={this.props.data.chatlog} readyState={this.props.data.readyState} />
        <Connect className={connectClass} readyState={this.props.data.readyState} />
        <Users className={userClass} readyState={this.props.data.readyState} users={this.props.data.users}  />
      </div>
    );
  }
});

module.exports = Chatblast;