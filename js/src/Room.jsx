var React = require('react');
var Actions = require('./Actions');

var Room = React.createClass({
    getInitialState: function(a, b, c, d){
        return {
            unread: 0,
            read: 0,
        };
    },
    componentWillReceiveProps: function(a, b, c, d){
        this.updateReadCount(this.props.currentRoom, this.props.room.chatlog);
    },
    handleSwitchClick: function(e){
        Actions.switchRooms(this.props.room.id);
    },
    handleJoinClick: function(e){
        Actions.joinRoom(this.props.room.id);
        Actions.switchRooms(this.props.room.id);
    },
    updateReadCount: function(currentRoom, chats){
        var oldRead = this.state.read;
        var oldUnread = this.state.unread;
        var newRead, newUnread;
        if (this.props.room.id === currentRoom) {
            // If currentroom, then consider everything read;
            newRead = chats.length;
            newUnread = 0;
        } else {
            // Otherwise, consider any new messages unread
            newRead = oldRead;
            newUnread = chats.length - newRead;
        }
        this.setState({read: newRead, unread: newUnread});
    },
    render: function() {
        var currentRoom = this.props.currentRoom;
        var room = this.props.room;
        var rid = room.id;
        var self = this.props.self;
        var myId = self.id;
        var roomClass = "room ";
        if (room.owner.id && myId === room.owner.id) {
            roomClass += "myRoom ";
        }
        if (rid === currentRoom) {
            roomClass += "selected";
            return (
                <div className={roomClass}>
                    <div>{room.name}</div>
                    <ul>{
                        Object.keys(room.subscribers).
                            sort(function(a, b){
                                return room.subscribers[a].name.toLowerCase() > room.subscribers[b].name.toLowerCase();
                            }).map(function(uid){
                                return (<li key={rid + uid}>{room.subscribers[uid].name}</li>);
                            })
                    }</ul>
                </div>
            );
        } else if (room.subscribers.hasOwnProperty(myId)) {
            var roomText = room.name;
            var unread = this.state.unread;
            if (unread > 0){
                roomText += " - " + unread + " unread";
                roomClass += " unread";
            }
            return (
                <div className={roomClass}>
                    <div onClick={this.handleSwitchClick}>{roomText}</div>
                </div>
            );
        } else {
            return (
                <div className={roomClass}>
                    <div onClick={this.handleJoinClick}>{room.name} - Click to join</div>
                </div>
            );
        }
    }
});

module.exports = Room;