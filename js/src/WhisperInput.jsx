var React = require('react');

var WhisperInput = React.createClass({
    handleClick: function(e){
        this.props.setWhisperee();
    },
    handleRoomMateClick: function(e) {
        
    },
    render: function(){
        var whisperState = this.props.whisperState;
        var whisperees = '';
        var roomMates = this.props.roomMates;
        var myId = this.props.myId;
        if (!whisperState) {
            whisperees = Object.keys(roomMates).
                filter(function(u){
                    return roomMates[u].id !== myId;
                }).
                sort(function(a, b){
                    return (
                        roomMates[a].name.toLowerCase() >
                        roomMates[b].name.toLowerCase()
                    );
                }).
                map(function(u){
                    return (<li onClick={this.handleRoomMateClick}>roomMates[u].name<li>);
                });
        }
        return (
            <div className="whisper">
                <span title={this.props.title} onClick={this.handleClick}></span>
            </div>
        );
    }
});

module.exports = WhisperInput;