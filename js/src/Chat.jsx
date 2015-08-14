var React = require('react');
var util = require('./util');

var Chat = React.createClass({
    render: function() {
        var chat = this.props.chat,
            dateString = util.convertFromEpoch(chat.time),
            output = false;

        var serializedChat = chat.msg.map(function(curr){
            var output = false;
            if (curr.text){
                output = (<span>{curr.text}</span>);
            } else if (curr.img64){
                output = (<img src={curr.img64} />);
            } else if (curr.img){
                output = (<img src={curr.img} />);
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