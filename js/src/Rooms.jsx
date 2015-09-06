var React = require('react');
var Actions = require('./Actions');
var Room = require('./Room.jsx');

var Rooms = React.createClass({
    getInitialState: function(){
        return {
            addOpen: false,
        };
    },
    handleAddClick: function(e){
        if (this.props.readyState === 1) {
            this.setState({addOpen: !this.state.addOpen});
        }
    },
    handleRemoveClick: function(e){
        var rid = e.target;

    },
    handleInputKeyUp: function(e){
        if (e.key === "Enter"){
            var name = e.target.value;
            e.target.value = "";
            this.addRoom(name);
            this.setState({addOpen: false});
        }
    },
    addRoom: function(name){
        Actions.newRoom(name);
    },
    render: function(){
        var rooms = this.props.rooms;
        var self = this.props.self;
        var currentRoom = this.props.currentRoom;
        var addOpen = this.state.addOpen ? '-' : '+';
        return (
            <div className={this.props.className} >
                <h4>Rooms</h4>
                <div className="roomList">
                    {Object.keys(rooms).
                        sort(function(a, b){
                            return rooms[a].name.toLowerCase() > rooms[b].name.toLowerCase();
                        }).map(function(rid){
                            return (<Room currentRoom={currentRoom} self={self} room={rooms[rid]} key={rid} />);
                        })
                    }
                </div>
                <div onClick={this.handleAddClick}>{addOpen} Add room</div>
                {this.state.addOpen ? <input onKeyUp={this.handleInputKeyUp}    type="text" placeholder="Room Name" /> : ""}
            </div>
        );
    }
});

module.exports = Rooms;