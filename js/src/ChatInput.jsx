var React = require('react');
var Chat = require('./Chat.jsx');
var Actions = require('./Actions');
var ImageUpload = require('./ImageUpload.jsx');

var ChatInput = React.createClass({
    addImg: function(img){
        var chatBox = React.findDOMNode(this.refs.chatBox);
        chatBox.appendChild(img);
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
                <div className="textInput" contentEditable={contentEditable} onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop} onKeyUp={this.handleKeyUp} onKeyDown={this.handleKeyDown} placeholder="Type a chatblast!" ref="chatBox">
                </div>
                <ImageUpload addImg={this.addImg} readyState={this.props.readyState} />
            </div>
        );
    }
});

module.exports = ChatInput;