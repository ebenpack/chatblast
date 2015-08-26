var Reflux = require('reflux');
var Actions = require('./Actions');

var initialState = {
    "readyState": 0,
    "rooms": {},
    "currentRoom":"global",
    "users": [],
    "self": {},
    "domain": ""
};

module.exports = Reflux.createStore({
    listenables: [Actions],
    getInitialState: function() {
        this.state = initialState;
        return this.state;
    },
    onConnect: function(name) {
        var nameQS = name ? ('?name=' + name) : '';
        var sock = new WebSocket("ws://" + this.state.domain + "/sock" + nameQS);
        this.sock = sock;
        try {
            var self = this;
            console.log("Websocket - status: " + sock.readyState);
            sock.onopen = function(m) {
                Actions.setReadyState(sock.readyState);
                Actions.getUsers();
                console.log("CONNECTION opened..." + self.state.readyState);
            };
            sock.onmessage = function(m) {
                Actions.processMsg(m.data);
            };
            sock.onerror = function(m) {
                Actions.setReadyState(sock.readyState);
                console.log("Error occured sending..." + m.data);
            };
            sock.onclose = function(m) {
                Actions.setReadyState(sock.readyState);
                console.log("Disconnected - status " + self.state.readyState);
                //setTimeout(function(){connect(name)}, 1000);
            };
        } catch (exception) {
            console.log(exception);
            //setTimeout(function(){connect(name)}, 1000);
        }
    },
    onChatBlast: function(msg){
        msg = JSON.parse(msg);
        msg.rid = this.state.currentRoom;
        this.sock.send(JSON.stringify(msg));
        this.trigger(this.state);
    },
    onSetReadyState: function(readyState){
        this.state.readyState = readyState;
        this.trigger(this.state);
    },
    onProcessMsg: function(msg) {
        try {
            var chatblast = JSON.parse(msg);
            switch (chatblast.cmd) {
                case "login":
                    Actions.addUser(chatblast.user);
                    break;
                case "logoff":
                    Actions.removeUser(chatblast.user);
                    break;
                case "msg":
                    Actions.addChat(chatblast);
                    break;
                case "sub":
                    Actions.subscribe(chatblast);
                    break;
                case "unsub":
                    Actions.unsubscribe(chatblast);
                    break;
            }
            console.log(JSON.stringify(chatblast, null, 4));
            this.trigger(this.state);
        } catch (e) {

        }
    },
    onSubscribe: function(chatblast){
        var room = chatblast.room;
        this.state.rooms.forEach(function(current){
            current.selected = false;
        });
        this.state.rooms.push({
            id: room,
            chatlog: [],
            selected: true,
        });
        if (!this.state.currentRoom){
            this.state.currentRoom = room;
        }
        this.trigger(this.state);
    },
    onUnsubscribe: function(chatblast){
        var room = chatblast.room;
        var idx = -1;
        for (var i = 0, len = this.state.rooms.length; i < len; i++){
            if (this.state.rooms[i].id === room){
                idx = i;
                break;
            }
        }
        if (idx >= 0){
            this.state.rooms.splice(idx, 1);
        }
        this.trigger(this.state);
    },
    onSelectRoom: function(id){
        this.state.currentRoom = id;
        this.trigger(this.state);
    },
    onGetUsers: function() {
        var request = new XMLHttpRequest();
        var self = this;
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    try {
                        self.state.users = JSON.parse(request.responseText).users;
                        self.trigger(self.state);
                    } catch (e) {

                    }
                }
            }
        };
        request.open('GET', '//' + self.state.domain + '/users', true);
        request.send(null);
    },
    onAddUser: function(user) {
        this.state.users.push(user);
        this.trigger(this.state);
    },
    onRemoveUser: function(user) {
        var idx = -1;
        for (var i = 0, len = this.state.users.length; i < len; i++) {
            var currentUser = this.state.users[i];
            if (currentUser.name === user.name) {
                idx = i;
                break;
            }
        }
        if (idx >= 0) {
            this.state.users.splice(idx, 1);
        }
        this.trigger(this.state);
    },
    onAddChat: function(chat) {
        var room = this.state.rooms[chat.rid];
        if (room) {
            room.chatlog.push(chat);

            if (room.chatlog.length > 20) {
                room.chatlog.shift();
            }
            this.trigger(this.state);
        }
    },
    onSetDomain: function(domain){
        this.state.domain = domain;
        this.trigger(this.state);
    }
});