var React = require('react');
var Reflux = require('reflux');
var Store = require('./Store');
var Chatlog = require('./Chatlog.jsx');
var Connect = require('./Connect.jsx');
var Rooms = require('./Rooms.jsx');
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
        roomClass = 'user';
    if (store.readyState === 0) {
        connectClass += " focus";
        chatClass += " blur";
        roomClass += " blur";
    } else if (store.readyState === 1) {
        chatClass += " focus";
        roomClass += " focus";
        connectClass += " blur";
    }
    var rooms = store.rooms;
    var idx = -1;
    for (var i = 0, len = rooms.length; i < len; i++){
        if (rooms[i].selected){
            idx = i;
            break;
        }
    }
    var chatlog = idx >= 0 ? rooms[idx].chatlog : [];
    return (
      <div className="chatblast">
        <Chatlog className={chatClass} chatlog={chatlog} readyState={store.readyState} />
        <Connect className={connectClass} readyState={store.readyState} />
        <Rooms className={roomClass} readyState={store.readyState} rooms={rooms}  />
      </div>
    );
  }
});

module.exports = Chatblast;