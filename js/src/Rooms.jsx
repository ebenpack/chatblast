var React = require('react');
var Reflux = require('reflux');
var Users = require('./Users.jsx');


// "rooms": {
//         "subscribed": {},
//         "selected": ""
//     },


var Rooms = React.createClass({
    render: function(){
        return (
            <div className={this.props.className + ' six columns'} >
                {this.props.rooms.map(function(room){
                    return (<div key={room.id}>Room {room.id}</div>);
                })}
            </div>
        );
    }
});

module.exports = Rooms;