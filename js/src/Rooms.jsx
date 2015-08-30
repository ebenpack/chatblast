var React = require('react');
var Reflux = require('reflux');
var Users = require('./Users.jsx');

var Rooms = React.createClass({
    render: function(){
        var rooms = this.props.rooms;
        var currentRoom = this.props.currentRoom;
        return (
            <div className={this.props.className} >
                <h4>Rooms</h4>
                {
                    Object.keys(rooms).
                        sort(function(a, b){
                            return rooms[a].name < rooms[b].name;
                        }).map(function(rid){
                            if (rid === currentRoom) {
                                return (
                                    <div className="room">
                                        <div key={rid}>{rooms[rid].name}</div>
                                        <ul>{
                                            Object.keys(rooms[rid].subscribers).
                                                sort(function(a, b){
                                                    return rooms[rid].subscribers[a].name < rooms[rid].subscribers[b].name;
                                                }).map(function(uid){
                                                    return <li>{rooms[rid].subscribers[uid].name}</li>
                                                })
                                        }</ul>
                                    </div>
                                );
                            }
                        })
                }
            </div>
        );
    }
});

module.exports = Rooms;