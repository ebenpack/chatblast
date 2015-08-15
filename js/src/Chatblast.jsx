var React = require('react');
var Reflux = require('reflux');
var Store = require('./Store');
var Chatlog = require('./Chatlog.jsx');
var Connect = require('./Connect.jsx');
var Users = require('./Users.jsx');
var Actions = require('./Actions');

var Chatblast = React.createClass({
    mixins: [
        Reflux.connect(Store),
    ],
    componentDidMount: function(){
        Actions.setDomain(this.props.domain);
  },
  render: function() {
    var store = this.state;
    var connectClass = 'connect',
        chatClass = 'chat',
        userClass = 'user';
    if (store.readyState === 0) {
        connectClass += " focus";
        chatClass += " blur";
        userClass += " blur";
    } else if (store.readyState === 1) {
        chatClass += " focus";
        userClass += " focus";
        connectClass += " blur";
    }
    return (
      <div className="chatblast">
        <Chatlog className={chatClass} chatlog={store.chatlog} readyState={store.readyState} />
        <Connect className={connectClass} readyState={store.readyState} />
        <Users className={userClass} readyState={store.readyState} users={store.users}  />
      </div>
    );
  }
});

module.exports = Chatblast;