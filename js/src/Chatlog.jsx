var React = require('react');
var Chat = require('./Chat.jsx');
var ChatInput = require('./ChatInput.jsx');

var Chatlog = React.createClass({
    getMaxHeight: function() {
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
        this.maxHeight = {
            maxHeight: (this.getMaxHeight() - 10) + 'px'
        };
    },
    componentDidUpdate: function() {
        if (this.shouldScrollBottom) {
            var node = React.findDOMNode(this.refs.log);
            node.scrollTop = node.scrollHeight;
        }
    },
    render: function() {
        return (
            <div className={this.props.className} >
                <ChatInput readyState={this.props.readyState} />
                <div className="messages" ref="log" style={this.maxHeight}>
                    {this.props.chatlog.map(function(chat){
                        return (<Chat key={chat.time} chat={chat} />);
                    })}
                </div>
            </div>
        );
    }
});

module.exports = Chatlog;