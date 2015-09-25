var React = require('react');
var UserList = require('./UserList.jsx');

var WhisperInput = React.createClass({
    render: function(){
        var whisperState = this.props.whisperState;
        var whisperees = '';
        var roomMates = this.props.roomMates;
        var myId = this.props.myId;
        if (whisperState) {
            whisperees = (<div className="whisperees"><UserList users={roomMates} showConnected={false} onClick={this.props.setWhisperee} /></div>);
        }
        return (
            <div className="whisper">
                <span className="whispericon" title={this.props.title} onClick={this.props.toggleWhisper}></span>
                {whisperees}
            </div>
        );
    }
});

module.exports = WhisperInput;