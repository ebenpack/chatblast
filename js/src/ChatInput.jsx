var React = require('react');
var Chat = require('./Chat.jsx');
var Actions = require('./Actions');
var ImageUpload = require('./ImageUpload.jsx');
var EmojiInput = require('./EmojiInput.jsx');

var ChatInput = React.createClass({
    getInitialState: function(){
        return {
            range: null,
        };
    },
    addElement: function(element){
        // Add element at the saved range, if it
        // exists, otherwise stick it at the end.
        var range = this.state.range;
        if (range) {
            range.deleteContents();
            range.insertNode(element);
            // Wipe out the range, as once text has been
            // added, it will no longer be meaningful
            this.setState({
                range: null,
            });
        } else {
            var chatBox = React.findDOMNode(this.refs.chatBox);
            chatBox.appendChild(element);
        }
    },
    handleBlur: function(e){
        // Save selection so it can be restored later
        // when we have focus again
        var range;
        if (window.getSelection && window.getSelection().getRangeAt) {
            range = window.getSelection().getRangeAt(0);
        }
        this.setState({
            range: range,
        });
    },
    handleFocus: function(e) {
        if (window.getSelection && this.state.range) {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this.state.range);
        }
    },
    handleDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
        var length = e.dataTransfer.files.length;
        if (length > 0) {
            var count = 0;
            Array.prototype.forEach.call(e.dataTransfer.files, function(curr) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var img = new Image();
                    img.src = e.target.result;
                    this.addImg(img);
                };
                reader.readAsDataURL(curr);
            });
        } else {
            var file_uris = e.dataTransfer.getData("text/uri-list");
            file_uris.split('\n').
            filter(function(curr) {
                return curr[0] !== "" && curr[0] !== "#";
            }).
            forEach(function(curr) {
                var img = new Image();
                img.src = curr;
                this.addImg(img);
            });
        }
    },
    handleKeyDown: function(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
        }
    },
    handleKeyUp: function(e) {
        var chatBox = React.findDOMNode(this.refs.chatBox);
        if (this.props.readyState === 1) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                this.submit();
            }
        } else {
            chatBox.textContent = "";
        }
    },
    submit: function() {
        var chatBox = React.findDOMNode(this.refs.chatBox);

        function serialize(prev, curr) {
            if (typeof curr === "string") {
                prev.push({
                    name: "text",
                    value: curr
                });
                return prev;
            } else if (curr.nodeName === "#text") {
                prev.push({
                    name: "text",
                    value: curr.textContent
                });
                return prev;
            } else if (curr.nodeName && curr.nodeName.toLowerCase() === "div") {
                prev.push.apply(prev, Array.prototype.reduce.call(curr.childNodes, serialize, []));
                return prev;
            } else if (curr.nodeName && curr.nodeName.toLowerCase() === "img") {
                prev.push({
                    name: "img",
                    value: curr.src
                });
                return prev;
            } else {
                return prev;
            }
        }
        chatBox.normalize();
        var msg = Array.prototype.reduce.call(chatBox.childNodes, serialize, []);
        if (msg.length !== 0) {
            Actions.chatBlast({
                "cmd": "msg",
                "data": msg
            });
            chatBox.textContent = '';
        }
    },
    handleDragEnter: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    handleDragOver: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },
    render: function() {
        var contentEditable = this.props.readyState === 1 ? "true" : "false";
        return (
            <div>
                <div 
                    className="textInput"
                    contentEditable={contentEditable}
                    onBlur={this.handleBlur}
                    onFocus={this.handleFocus}
                    onDragEnter={this.handleDragEnter}
                    onDragOver={this.handleDragOver}
                    onDrop={this.handleDrop}
                    onKeyUp={this.handleKeyUp}
                    onKeyDown={this.handleKeyDown}
                    placeholder="Type a chatblast!"
                    ref="chatBox">
                </div>
                <ImageUpload addElement={this.addElement} readyState={this.props.readyState} />
                <EmojiInput readyState={this.props.readyState} addElement={this.addElement} />
            </div>
        );
    }
});

module.exports = ChatInput;