var React = require('react');
var Chat = require('./Chat.jsx');
var Actions = require('./Actions');

var Chatlog = React.createClass({
    handleDrop: function(e) {
        var chatlog = this;
        var msg = React.findDOMNode(chatlog.refs.msg);
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
                    msg.appendChild(img);
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
                msg.appendChild(img);
            });
        }
    },
    handleKeyDown: function(e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
        }
    },
    handleKeyUp: function(e) {
        var msg = React.findDOMNode(this.refs.msg);
        if (this.props.readyState === 1) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                this.submit();
            }
        } else {
            msg.textContent = "";
        }
    },
    getMaxHeight: function(){
        var node = React.findDOMNode(this.refs.log);
        if (node) {
            var rect = node.getBoundingClientRect();
            var winHeight = window.innerHeight;
            return winHeight - rect.top;
        }
    },
    componentWillUpdate: function() {
        var node = React.findDOMNode(this.refs.log);
        this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
    },

    componentDidUpdate: function() {
        if (this.shouldScrollBottom) {
            var node = React.findDOMNode(this.refs.log);
            node.scrollTop = node.scrollHeight;
        }
    },
    submit: function() {
        var chatBox = React.findDOMNode(this.refs.msg);

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
            Actions.chatBlast(JSON.stringify({
                "cmd": "msg",
                "data": msg
            }));
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
        var maxHeight = this.getMaxHeight();
        if (maxHeight) {
            maxHeight = {"max-height": maxHeight + "px"};
        } else {
            maxHeight = {};
        }
        var contentEditable = this.props.readyState === 1 ? "true" : "false";
        return (
            <div className={this.props.className} >
                <div className="textInput" contentEditable={contentEditable} onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop} onKeyUp={this.handleKeyUp} onKeyDown={this.handleKeyDown} placeholder="Type a chatblast!" ref="msg">
                </div>
                <div className="messages" ref="log" style={maxHeight}>
                    {this.props.chatlog.map(function(chat){
                        return (<Chat key={chat.time} chat={chat} />);
                    })}
                </div>
            </div>
        );
    }
});

module.exports = Chatlog;