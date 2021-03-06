var React = require('react');
var Reflux = require('reflux');
var Store = require('./Store');
var Chatlog = require('./Chatlog.jsx');
var ChatInput = require('./ChatInput.jsx');
var Rooms = require('./Rooms.jsx');
var Users = require('./Users.jsx');
var Commands = require('./Commands.jsx');
var Actions = require('./Actions');

var Chatblast = React.createClass({
    mixins: [
        Reflux.connect(Store),
    ],
    componentDidMount: function() {
        Actions.setDomain(this.props.domain);
        Actions.getRooms();
        Actions.getUsers();
    },
    render: function() {
        var store = this.state;
        var connectClass = 'connect',
            chatClass = 'chat',
            roomClass = 'rooms',
            userClass = 'users';
        if (store.readyState !== 1) {
            connectClass += " focus";
            chatClass += " blur";
            roomClass += " blur";
            userClass += " blur";
        } else {
            chatClass += " focus";
            roomClass += " focus";
            userClass += " focus";
            connectClass += " blur";
        }
        var rooms = store.rooms;
        var users = store.users;
        var self = store.self;
        var currentRoom = store.currentRoom;
        var roomMates = {};
        if (currentRoom) {
            roomMates = rooms[currentRoom].subscribers;
        }
        var chatlog = rooms[currentRoom] ? rooms[currentRoom].chatlog : [];
        var commands = '';
        if (store.readyState !== 1) {
            commands = (
                <Commands
                    className={connectClass}
                    readyState={store.readyState}
                />
            );
        }
        return (
            <div className="chatblast">
                <div className="left six columns">
                    <div className={chatClass} >
                        <ChatInput
                            readyState={store.readyState}
                            roomMates={roomMates}
                            self={self}
                            blocked={store.blocked}
                            whisperState={store.whisperState}
                            whisperee={store.whisperee}
                        />
                        <Chatlog
                            chatlog={chatlog}
                            users={users}
                            readyState={store.readyState}
                            blocked={store.blocked}
                        />
                    </div>
                </div>
                <div className="right six columns">
                    <Rooms
                        className={roomClass}
                        readyState={store.readyState}
                        rooms={rooms}
                        currentRoom={currentRoom}
                        self={self}
                        blocked={store.blocked}
                    />
                    <Users
                        className={userClass}
                        readyState={store.readyState}
                        self={self}
                        users={users}
                        currentRoom={currentRoom}
                        blocked={store.blocked}
                    />
                    {commands}
                </div>
            </div>
        );
    }
});

module.exports = Chatblast;