var React = require('react');
var util = require('./util');
var Chat = require('./Chat.jsx');

var Chatlog = React.createClass({
    getInitialState: function() {
        return {
            maxHeight: 0,
            shouldScrollBottom: true,
        };
    },
    handleResize: function(e) {
        this.setState({
            maxHeight: this.getMaxHeight()
        });
    },
    componentDidMount: function() {
        window.addEventListener('resize', util.debounce(this.handleResize, 150));
    },
    componentWillUnmount: function() {
        window.removeEventListener('resize', util.debounce(this.handleResize, 150));
    },
    getMaxHeight: function() {
        var node = React.findDOMNode(this.refs.log);
        if (node) {
            var rect = node.getBoundingClientRect();
            var winHeight = window.innerHeight;
            return Math.max(((winHeight - rect.top) - 10), 200) + 'px';
        }
    },
    componentWillReceiveProps: function() {
        var node = React.findDOMNode(this.refs.log);
        this.setState({
            shouldScrollBottom: node.scrollTop + node.offsetHeight === node.scrollHeight,
            maxHeight: this.getMaxHeight(),
        });
    },
    componentDidUpdate: function() {
        if (this.state.shouldScrollBottom) {
            var node = React.findDOMNode(this.refs.log);
            node.scrollTop = node.scrollHeight;
        }
    },
    render: function() {
        return (
            <div className="messages" ref="log" style={{maxHeight: this.state.maxHeight}}>
                {this.props.chatlog.map(function(chat, index){
                    return (<Chat key={index} users={this.props.users} chat={chat} blocked={this.props.blocked} />);
                }, this)}
            </div>
        );
    }
});

module.exports = Chatlog;