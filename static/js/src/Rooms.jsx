var React = require('react');
var Actions = require('./Actions');
var Room = require('./Room.jsx');

var Rooms = React.createClass({
    getInitialState: function() {
        return {
            addOpen: false,
        };
    },
    handleAddClick: function(e) {
        if (this.props.readyState === 1) {
            this.setState({
                addOpen: !this.state.addOpen
            });
        }
    },
    handleInputKeyUp: function(e) {
        if (this.props.readyState === 1) {
            if (e.key === "Enter") {
                var name = e.target.value;
                e.target.value = "";
                this.addRoom(name);
                this.setState({
                    addOpen: false
                });
            }
        }
    },
    addRoom: function(name) {
        Actions.newRoom(name);
    },
    filterRooms: function(fn) {
        var self = this.props.self;
        var rooms = this.props.rooms;
        var currentRoom = this.props.currentRoom;
        var readyState = this.props.readyState;
        return Object.keys(rooms).
            filter(function(rid) {
                return fn(rooms[rid]);
            }).
            sort(function(a, b) {
                return rooms[a].name.toLowerCase() > rooms[b].name.toLowerCase();
            }).
            map(function(rid) {
                return (<Room readyState={readyState} currentRoom={currentRoom} self={self} room={rooms[rid]} key={rid} />);
            });
    },
    render: function() {
        var rooms = this.props.rooms;
        var self = this.props.self;
        var myId = self.id;
        var currentRoom = this.props.currentRoom;
        var addOpen = this.state.addOpen ? '-' : '+';
        return (
            <div className={this.props.className} >
                <h4>Rooms</h4>
                <div className="roomList">
                    <h5>My rooms</h5>
                    <div>
                        {this.filterRooms(function(room){
                            return room.owner.id === myId;
                        })}
                    </div>
                    <h5>Subscribed</h5>
                    <div>
                        {this.filterRooms(function(room){
                            return (
                                myId &&
                                room.owner.id !== myId &&
                                room.subscribers.hasOwnProperty(myId)
                            );
                        })}
                    </div>
                    <h5>Open rooms</h5>
                        {this.filterRooms(function(room){
                            return !(myId && room.subscribers.hasOwnProperty(myId));
                        })}
                    <div>
                    </div>
                    
                </div>
                <div onClick={this.handleAddClick}>{addOpen} Add room</div>
                {this.state.addOpen ? <input onKeyUp={this.handleInputKeyUp}    type="text" placeholder="Room Name" /> : ""}
            </div>
        );
    }
});

module.exports = Rooms;