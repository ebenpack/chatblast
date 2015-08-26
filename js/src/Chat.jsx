var React = require('react');
var util = require('./util');

var Chat = React.createClass({
    render: function() {
        var chat = this.props.chat,
            dateString = util.convertFromEpoch(chat.time),
            output = false;

        var serializedChat = chat.msg.map(function(curr, idx){
            var output = false;
            if (curr.name === "text"){
                output = (<span key={idx} >{curr.value}</span>);
            } else if (curr.name === "img"){
                output = (<img key={idx} src={curr.value} />);
            }
            return output;
        });
        return (
            <div className="msg">
                <div className="payload">
                    {chat.user.name + " sez: "}{serializedChat}
                </div>
                <div className="time">
                    {dateString}
                </div>
            </div>
        );
    }
});

module.exports = Chat;