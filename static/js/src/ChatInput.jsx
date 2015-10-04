var React = require('react');
var Actions = require('./Actions');
var ImageUpload = require('./ImageUpload.jsx');
var EmojiInput = require('./EmojiInput.jsx');
var TextInput = require('./TextInput.jsx');
var WhisperInput = require('./WhisperInput.jsx');

var ChatInput = React.createClass({
    getInitialState: function() {
        return {
            whisperMenuActive: false,
            emojiMenuActive: false,
        };
    },
    setWhisperMenuState: function(state){
        this.setState({
            whisperMenuActive: state,
        });
    },
    setEmojiMenuState: function(state){
        this.setState({
            emojiMenuActive: state,
        });
    },
    addElement: function(element) {
        this.refs.TextInput.addElement(element);
    },
    render: function() {
        var myId = this.props.self.id;
        return (
            <div>
                <TextInput
                    readyState={this.props.readyState}
                    whisperState={this.props.whisperState}
                    whisperee={this.props.whisperee}
                    ref="TextInput"
                />
                <ImageUpload
                    readyState={this.props.readyState}
                    addElement={this.addElement}
                    title="Upload image"
                />
                <EmojiInput
                    readyState={this.props.readyState}
                    addElement={this.addElement}
                    emojiMenuActive={this.state.emojiMenuActive}
                    setEmojiMenuState={this.setEmojiMenuState}
                    setWhisperMenuState={this.setWhisperMenuState}
                    title="Add emoji"
                />
                <WhisperInput
                    readyState={this.props.readyState}
                    setEmojiMenuState={this.setEmojiMenuState}
                    setWhisperMenuState={this.setWhisperMenuState}
                    whisperMenuActive={this.state.whisperMenuActive}
                    whisperState={this.props.whisperState}
                    roomMates={this.props.roomMates}
                    toggleWhisper={this.toggleWhisper}
                    myId={myId}
                    blocked={this.props.blocked}
                    title="Send whisper"
                />
            </div>
        );
    }
});

module.exports = ChatInput;