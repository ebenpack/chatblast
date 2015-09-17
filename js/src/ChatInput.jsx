var React = require('react');
var Chat = require('./Chat.jsx');
var Actions = require('./Actions');
var ImageUpload = require('./ImageUpload.jsx');
var EmojiInput = require('./EmojiInput.jsx');
var TextInput = require('./TextInput.jsx');

var ChatInput = React.createClass({
    addElement: function(element) {
        this.refs.TextInput.addElement(element);
    },
    render: function() {
        return (
            <div>
                <TextInput readyState={this.props.readyState} ref="TextInput" />
                <ImageUpload addElement={this.addElement} readyState={this.props.readyState} />
                <EmojiInput readyState={this.props.readyState} addElement={this.addElement} />
            </div>
        );
    }
});

module.exports = ChatInput;