var React = require('react');
var UserList = require('./UserList.jsx');

var WhisperInput = React.createClass({
    setWhisperee: function(e, user){
        this.props.setWhisperMenuState(false);
        this.props.setEmojiMenuState(false);
        this.props.setWhisperee(e, user);
    },
    toggleWhisperMenu: function(e){
        if (this.props.readyState === 1 && Object.keys(this.filterRoommates()).length > 0) {
            if (!this.props.whisperMenuActive && this.props.whisperState) {
                // If whisper menu not showing and user currently
                // whispering, cancel whispering and don't show menu
                this.props.toggleWhisper();
            } else {
                this.props.setWhisperMenuState(!this.props.whisperMenuActive);
                this.props.setEmojiMenuState(false);
            }
        }
    },
    filterRoommates: function(){
        var roomMates = this.props.roomMates;
        var filteredRoomMates = {};
        var uid;
        var myId = this.props.myId;
        for (uid in roomMates) {
            if (roomMates.hasOwnProperty(uid) && (uid !== myId)) {
                filteredRoomMates[uid] = roomMates[uid];
            }
        }
        return filteredRoomMates;
    },
    render: function(){
        var whisperState = this.props.whisperState;
        var whisperMenuActive = this.props.whisperMenuActive;
        var whisperees = '';
        var roomMates = this.props.roomMates;
        var myId = this.props.myId;
        var whispericon = "whispericon inactive";
        if (whisperState) {
            whispericon = "whispericon active";
        }
        if (whisperMenuActive) {
            whisperees = (
                <div className="whisperees">
                    <UserList
                        users={this.filterRoommates()}
                        onClick={this.setWhisperee}
                        blocked={this.props.blocked}
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