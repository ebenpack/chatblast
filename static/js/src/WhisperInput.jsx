var React = require('react');
var UserList = require('./UserList.jsx');

var WhisperInput = React.createClass({
    setWhisperee: function(e, user){
        this.props.setWhisperMenuState(false);
        this.props.setEmojiMenuState(false);
        this.props.setWhisperee(e, user);
    },
    toggleWhisperMenu: function(e){
        if (!this.props.whisperMenuActive && this.props.whisperState) {
            // If whisper menu not showing and user currently
            // whispering, cancel whispering and don't show menu
            this.props.toggleWhisper();
        } else {
            this.props.setWhisperMenuState(!this.props.whisperMenuActive);
            this.props.setEmojiMenuState(false);
        }
    },
    render: function(){
        var whisperState = this.props.whisperState;
        var whisperMenuActive = this.props.whisperMenuActive;
        var whisperees = '';
        var roomMates = this.props.roomMates;
        var myId = this.props.myId;
        var whispericon = "whispericon inactive";
        function filterRoommates(uid){
            return uid !== myId;
        }
        if (whisperState) {
            whispericon = "whispericon active";
        }
        if (whisperMenuActive) {
            whisperees = (
                <div className="whisperees">
                    <UserList
                        users={roomMates}
                        filterUsers={filterRoommates}
                        showConnected={false}
                        onClick={this.setWhisperee}
                    />
                </div>
            );
        }
        return (
            <div className="whisper">
                <span
                    className={whispericon}
                    title={this.props.title}
                    onClick={this.toggleWhisperMenu}
                ></span>
                {whisperees}
            </div>
        );
    }
});

module.exports = WhisperInput;