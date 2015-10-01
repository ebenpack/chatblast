var React = require('react');
var util = require('./util');

var Chat = React.createClass({
    render: function() {
        var chat = this.props.chat,
            dateString = util.convertFromEpoch(chat.time),
            output = false,
            users = this.props.users;

        var serializedChat = chat.data.map(function(curr, idx) {
            var output = false,
                text;
            if (curr.name.indexOf("text") === 0) {
                var styles = curr.name.split(',').slice(1);
                text = (<span key={idx} >{curr.value}</span>);
                output = styles.reduce(function(prev, curr) {
                    if (curr === 'i') {
                        return (<i>{prev}</i>);
                    } else if (curr === 'b') {
                        return (<b>{prev}</b>);
                    } else if (curr === 'u') {
                        return (<u>{prev}</u>);
                    } else {
                        return prev;
                    }
                }, text);
            } else if (curr.name === "img") {
                output = (<img key={idx} src={curr.value} />);
            }
            return output;
        });
        var sez = chat.cmd === 'msg' ? " sez: " : " whispers at " + chat.whisperee.name + ": ";
        if (this.props.blocked.hasOwnProperty(chat.user.id)) {
            return (<div className="blocked">*blocked*</div>);
        } else {
            return (
                <div className="msg">
                    <div className="payload">
                        {chat.user.name + sez}{serializedChat}
                    </div>
                    <div className="time">
                        {dateString}
                    </div>
                </div>
            );
        }
    }
});

module.exports = Chat;