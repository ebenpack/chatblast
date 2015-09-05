var React = require('react');
var Actions = require('./Actions');

var Room = React.createClass({
    getInitialState: function(){
        return {
            unread: 0,
            read: 0,
        };
    },
    componentWillReceiveProps: function(){
        this.updateReadCount(this.props.currentRoom, this.props.room.chatlog);
    },
    handleSwitchClick: function(e){
        Actions.switchRooms(this.props.rid);
    },
    updateReadCount: function(currentRoom, chats){
        var oldRead = this.state.read;
        var oldUnread = this.state.unread;
        var newRead, newUnread;
        if (this.props.rid === currentRoom) {
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
        var rid = this.props.rid;
        var chats = this.props;
        if (rid === currentRoom) {
            return (
                <div className="room selected">
                    <div key={rid}>{room.name}</div>
                    <ul>{
                        Object.keys(room.subscribers).
                            sort(function(a, b){
                                return room.subscribers[a].name.toLowerCase() > room.subscribers[b].name.toLowerCase();
                            }).map(function(uid){
                                return <li>{room.subscribers[uid].name}</li>
                            })
                    }</ul>
                </div>
            );
        } else {
            return (
                <div className="room">
                    <div onClick={this.handleSwitchClick} key={rid}>{room.name} - {this.state.unread} unread</div>
                </div>
            );
        }
    }
});

module.exports = Room;