/**
 * @jsx React.DOM
 */

function convertFromEpoch(timestamp){
    var d = new Date(0),
        dateString;
    d.setUTCSeconds(timestamp).toString();
    return d.toLocaleTimeString();
}

var Chat = React.createClass({
    render: function() {
        var chat = this.props.chat,
            dateString = convertFromEpoch(chat.time),
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

var Chatlog = React.createClass({
    handleDrop: function(e){
        var chatlog = this;
        var msg = React.findDOMNode(chatlog.refs.msg);
        e.stopPropagation();
        e.preventDefault();
        var length = e.dataTransfer.files.length;
        if (length > 0){
            var count = 0;
            Array.prototype.forEach.call(e.dataTransfer.files, function(curr){
                var reader = new FileReader();
                reader.onload = function(e){
                    var img = new Image();
                    img.src = e.target.result;
                    msg.appendChild(img);
                };
                reader.readAsDataURL(curr);
            });
        } else {
            var file_uris = e.dataTransfer.getData("text/uri-list");
            file_uris.split('\n').
                filter(function(curr){
                    return curr[0]!=="" && curr[0]!=="#";
                }).
                forEach(function(curr){
                    var img = new Image();
                    img.src = curr;
                    msg.appendChild(img);
            });
        }
    },
    handleKeyDown: function(e){
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
        }
    },
    handleKeyUp: function(e){
        var msg = React.findDOMNode(this.refs.msg);
        if (this.props.readyState === 1){
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                this.submit();
            }
        } else {
           msg.textContent = "";
        }
    },
  submit: function() {
    var chatBox = React.findDOMNode(this.refs.msg);
    function serialize (prev, curr) {
        if (typeof curr === "string"){
            prev.push({text: curr});
            return prev;
        } else if (curr.nodeName === "#text"){
            prev.push({text: curr.textContent});
            return prev;
        } else if (curr.nodeName && curr.nodeName.toLowerCase() === "div") {
            prev.push.apply(prev, Array.prototype.reduce.call(curr.childNodes, serialize, []));
            return prev;
        } else if (curr.nodeName && curr.nodeName.toLowerCase() === "img") {
            prev.push({img: curr.src});
            return prev;
        } else {
            return prev;
        }
    }
    var msg = Array.prototype.reduce.call(chatBox.childNodes, serialize, []);
    if (msg.length !== 0){
        chatBlast(JSON.stringify({"type":"msg", "data":msg}));
        chatBox.textContent = '';
    }
  },
  handleDragEnter: function(e){
    e.stopPropagation();
    e.preventDefault();
  },
    handleDragOver: function(e){
        e.stopPropagation();
        e.preventDefault();

    },
  render: function() {
    return (
        <div className={this.props.className + ' six columns'} >
            <div className="textInput" contentEditable="true" onDragEnter={this.handleDragEnter} onDragOver={this.handleDragOver} onDrop={this.handleDrop} onKeyUp={this.handleKeyUp} onKeyDown={this.handleKeyDown} placeholder="Type a chatblast!" ref="msg">
            </div>
            <div className="messages">
                {this.props.chatlog.map(function(chat){
                    return (<Chat chat={chat} />)
                })}
            </div>
        </div>
    );
  }
});

var Users = React.createClass({
    render: function(){
        return (
            <div className={this.props.className + ' six columns'} >
                {this.props.users.map(function(user){
                    return (<div>User {user.name}, connected at {convertFromEpoch(user.connected)}</div>)
                })}
            </div>
        )
    }
});

var Connect = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    if (this.props.readyState === 0){
        var name = React.findDOMNode(this.refs.name);
        connect(name.value.trim());
        name.value = '';
    }
  },
  render: function() {
    return (
        <div className={this.props.className + ' twelve columns'}>
            <form onSubmit={this.handleSubmit}>
                <input placeholder="Your name" ref="name" />
                <input type="submit" value="Connect" />
            </form>
        </div>
    );
  }
});

var App = React.createClass({
  render: function() {
    var connectClass = 'connect',
        chatClass = 'chat',
        userClass = 'user';
    if (this.props.data.readyState === 0) {
        connectClass += " focus";
        chatClass += " blur";
        userClass += " blur";
    } else if (this.props.data.readyState === 1) {
        chatClass += " focus";
        userClass += " focus";
        connectClass += " blur";
    }
    return (
      <div className="app">
        <Chatlog className={chatClass} chatlog={this.props.data.chatlog} readyState={this.props.data.readyState} />
        <Connect className={connectClass} readyState={this.props.data.readyState} />
        <Users className={userClass} readyState={this.props.data.readyState} users={this.props.data.users}  />
      </div>
    );
  }
});