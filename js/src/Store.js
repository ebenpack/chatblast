var Reflux = require('reflux');
var Actions = require('./Actions');

var initialState = {
    "readyState": 0,
    "rooms": {},
    "currentRoom": "global",
    "users": {},
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
        this.state.rooms = {};
        this.state.users = {};
        Actions.getRooms();
        Actions.getUsers();
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
    onChatBlast: function(msg) {
        msg = JSON.parse(msg);
        msg.rid = this.state.currentRoom;
        this.sock.send(JSON.stringify(msg));
        this.trigger(this.state);
    },
    onSetReadyState: function(readyState) {
        this.state.readyState = readyState;
        this.trigger(this.state);
    },
    onSubscribe: function(rid, user){
        this.state.rooms[rid].subscribers[user.id] = user;
        this.trigger(this.state);
    },
    onUnsubscribe: function(chatblast) {
        delete this.state.rooms[chatblast.rid].subscribers[chatblast.uid];
        this.trigger(this.state);
    },
    onSelectRoom: function(id) {
        this.state.currentRoom = id;
        this.trigger(this.state);
    },
    onGetRooms: function() {
        var request = new XMLHttpRequest();
        var self = this;
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    try {
                        var body = JSON.parse(request.responseText);
                        for (var rid in body) {
                            if (body.hasOwnProperty(rid)){
                                Actions.addRoom(rid, body[rid]);
                            }
                        }
                        self.trigger(self.state);
                    } catch (e) {

                    }
                }
            }
        };
        request.open('GET', '//' + self.state.domain + '/rooms', true);
        request.send(null);
    },
    onGetUsers: function() {
        var request = new XMLHttpRequest();
        var self = this;
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    try {
                        var body = JSON.parse(request.responseText);
                        for (var uid in body) {
                            if (body.hasOwnProperty(uid)){
                                Actions.addUser(uid, body[uid]);
                            }
                        }
                        self.trigger(self.state);
                    } catch (e) {

                    }
                }
            }
        };
        request.open('GET', '//' + self.state.domain + '/users', true);
        request.send(null);
    },
    onAddUser: function(uid, user) {
        this.state.users[uid] = user;
        this.trigger(this.state);
    },
    onRemoveUser: function(uid) {
        delete this.state.users[uid];
        this.trigger(this.state);
    },
    onAddRoom: function(rid, roomObj) {
        if (!this.state.rooms.hasOwnProperty(rid)){
            this.state.rooms[rid] = {
                chatlog: [],
                name: roomObj.name,
                subscribers: roomObj.subscribers ? roomObj.subscribers : {},
            };
            this.trigger(this.state);
        }
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
    onSetDomain: function(domain) {
        this.state.domain = domain;
        this.trigger(this.state);
    },
    onProcessMsg: function(msg) {
        try {
            var chatblast = JSON.parse(msg);
            switch (chatblast.cmd) {
                case "login":
                    Actions.addUser(chatblast.user.id, chatblast.user);
                    break;
                case "logoff":
                    Actions.removeUser(chatblast.uid);
                    break;
                case "msg":
                    Actions.addChat(chatblast);
                    break;
                case "sub":
                    Actions.subscribe(chatblast.rid, chatblast.user);
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
});