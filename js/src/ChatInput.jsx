var React = require('react');
var Actions = require('./Actions');
var ImageUpload = require('./ImageUpload.jsx');
var EmojiInput = require('./EmojiInput.jsx');
var TextInput = require('./TextInput.jsx');
var WhisperInput = require('./WhisperInput.jsx');

var ChatInput = React.createClass({
    getInitialState: function() {
        return {
            whisperState: false,
            whisperee: '',
        };
    },
    toggleWhisper: function(){
        this.setState({
            whisperState: !this.state.whisperState,
        });
    },
    setWhisperee: function(uid) {
        this.setState({
            whisperState: true,
            whisperee: uid,
        });
    },
    addElement: function(element) {
        this.refs.TextInput.addElement(element);
    },
    render: function() {
        var myId = this.props.self.id;
        return (
            <div>
                <TextInput readyState={this.props.readyState} whisperState={this.state.whisperState} ref="TextInput" />
                <ImageUpload readyState={this.props.readyState} addElement={this.addElement} title="Upload image" />
                <EmojiInput readyState={this.props.readyState} addElement={this.addElement} title="Add emoji" />
                <WhisperInput readyState={this.props.readyState} toggleWhisper={this.toggleWhisper} whisperState={this.state.whisperState} roomMates={this.props.roomMates} myId={myId} title="Send whisper" />
            </div>
        );
    }
});

module.exports = ChatInput;