var React = require('react');
var Actions = require('./Actions');

var TextInput = React.createClass({
    getInitialState: function() {
        return {
            range: null,
        };
    },
    addElement: function(element) {
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
    handleBlur: function(e) {
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
        } else if (e.keyCode === 66 && e.ctrlKey) {
            // Bold
            e.preventDefault();
            document.execCommand('bold', false, null);
        } else if (e.keyCode === 73 && e.ctrlKey) {
            // Italic
            e.preventDefault();
            document.execCommand('italic', false, null);
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

        function serialize(elmnt) {
            function helper(prev, curr) {
                var nodeName = curr.nodeName;
                if (typeof curr === "string") {
                    prev.push({
                        name: "text",
                        value: curr
                    });
                    console.log("GOT SOME TEXT");
                    return prev;
                } else if (curr.nodeName === "#text") {
                    var computedStyle = window.getComputedStyle(curr.parentElement);
                    var name = "text";
                    if (computedStyle.fontWeight === 'bold') {
                        name += ',b';
                    }
                    if (computedStyle.fontStyle === 'italic') {
                        name += ',i';
                    }
                    if (computedStyle.textDecoration === 'underline') {
                        name += ',u';
                    }
                    prev.push({
                        name: name,
                        value: curr.textContent
                    });
                    return prev;
                } else if (curr.nodeName && curr.nodeName.toLowerCase() === "img") {
                    prev.push({
                        name: "img",
                        value: curr.src
                    });
                    return prev;
                } else if (curr.childNodes) {
                    prev.push.apply(prev, serialize(curr));
                }
                return prev;
            }
            return Array.prototype.reduce.call(elmnt.childNodes, helper, []);
        }
        chatBox.normalize();
        var msg = serialize(chatBox);
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
        );
    }
});

module.exports = TextInput;