var React = require('react');
var Actions = require('./Actions');
var UserList = require('./UserList.jsx');

var Room = React.createClass({
    getInitialState: function() {
        return {
            unread: 0,
            read: 0,
            closing: false,
            confirmedClose: false,
        };
    },
    componentWillReceiveProps: function() {
        this.updateReadCount(this.props.currentRoom, this.props.room.chatlog);
    },
    handleSwitchClick: function(e) {
        if (this.props.readyState === 1) {
            Actions.switchRooms(this.props.room.id);
        }
    },
    handleJoinClick: function(e) {
        if (this.props.readyState === 1) {
            Actions.joinRoom(this.props.room.id);
            Actions.switchRooms(this.props.room.id);
        }
    },
    handleCloseClick: function(e) {
        if (this.props.readyState === 1) {
            this.setState({
                closing: true,
            });
        }
    },
    handleConfirmCloseClick: function(e) {
        if (this.isMyRoom()) {
            Actions.closeRoom(this.props.room.id);
        } else {
            Actions.leaveRoom(this.props.room.id);
        }
    },
    handleCancelCloseClick: function(e) {
        this.setState({
            closing: false,
        });
    },
    isMyRoom: function() {
        var ownerId = this.props.room.owner.id;
        return (
            ownerId &&
            this.props.self.id === ownerId
        );
    },
    updateReadCount: function(currentRoom, chats) {
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
        this.setState({
            read: newRead,
            unread: newUnread
        });
    },
    render: function() {
        var currentRoom = this.props.currentRoom;
        var room = this.props.room;
        var rid = room.id;
        var self = this.props.self;
        var myId = self.id;
        var roomClass = "room ";
        var roomText = room.name;
        if (this.isMyRoom()) {
            roomClass += "myRoom ";
        }
        if (this.state.closing) {
            var leaveText = "";
            if (this.isMyRoom()) {
                leaveText = "Close";
            } else {
                leaveText = "Leave";
            }
            roomClass += "closeconfirm";
            return (
                <div className={roomClass}>
                    <p>Are you sure you want to {leaveText.toLowerCase()} this room?</p>
                    <div className="buttons">
                        <button className="confirm" onClick={this.handleConfirmCloseClick}>{leaveText}</button>
                        <button className="cancel" onClick={this.handleCancelCloseClick}>Cancel</button>
                    </div>
                </div>
            );
        } else if (rid === currentRoom) {
            roomClass += "selected";
            var closeButton = <button className="close" onClick={this.handleCloseClick}>✖</button>;
            return (
                <div className={roomClass}>
                    <div>{roomText}{closeButton}</div>
                    <UserList
                        users={room.subscribers}
                        blocked={this.props.blocked}
                    />
                </div>
            );
        } else if (myId && room.subscribers.hasOwnProperty(myId)) {
            var unread = this.state.unread;
            if (unread > 0) {
                roomText += " - " + unread + " unread";
                roomClass += " unread";
            }
            return (
                <div className={roomClass}>
                    <div onClick={this.handleSwitchClick}>{roomText}</div>
                </div>
            );
        } else {
            roomText += " - Join";
            return (
                <div className={roomClass}>
                    <div onClick={this.handleJoinClick}>{roomText}</div>
                </div>
            );
        }
    }
});

module.exports = Room;