var Reflux = require('reflux');
var Actions = require('./Actions');

var reqwest = require('reqwest');

var initialState = {
    "readyState": 0,
    "rooms": {},
    "currentRoom": "",
    "users": {},
    "self": {
        id: null
    },
    "domain": ""
};

module.exports = Reflux.createStore({
    listenables: [Actions],
    getInitialState: function() {
        this.state = initialState;
        return this.state;
    },
    switchCurrentRoom: function() {
        if (this.state.rooms.global.subscribers.hasOwnProperty(this.state.self.id)) {
            this.state.currentRoom = "global";
        } else {
            this.state.currentRoom = "";
        }
        this.trigger({
            currentRoom: this.state.currentRoom
        });
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
                Actions.getRooms();
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
            };

        } catch (e) {
            console.log(e);
        }
    },
    onChatBlast: function(msg) {
        msg.rid = this.state.currentRoom;
        this.sock.send(JSON.stringify(msg));
    },
    onSetReadyState: function(readyState) {
        this.state.readyState = readyState;
        this.trigger({
            readyState: this.state.readyState
        });
    },
    onSubscribe: function(rid, user) {
        this.state.rooms[rid].subscribers[user.id] = user;
        if (user.id === this.state.self.id) {
            Actions.getRoom(rid);
        }
        this.trigger({
            rooms: this.state.rooms
        });
    },
    onUnsubscribe: function(chatblast) {
        delete this.state.rooms[chatblast.rid].subscribers[chatblast.uid];

        if (chatblast.uid === this.state.self.id && this.state.currentRoom === chatblast.rid) {
            this.switchCurrentRoom();
        }
        this.trigger({
            rooms: this.state.rooms
        });
    },
    onSelectRoom: function(id) {
        this.state.currentRoom = id;
        this.trigger({
            currentRoom: this.state.currentRoom
        });
    },
    onGetRooms: function() {
        return reqwest('//' + this.state.domain + '/rooms/')
            .then(function(resp) {
                for (var rid in resp) {
                    if (resp.hasOwnProperty(rid)) {
                        Actions.addRoom(rid, resp[rid]);
                    }
                }
            }, function(err, msg) {
                console.log('Error: getRooms request failed', err, msg);
            });
    },
    onGetRoom: function(rid) {
        return reqwest('//' + self.state.domain + '/rooms/' + rid)
            .then(function(resp) {
                Actions.addRoom(rid, resp);
            }, function(err, msg) {
                console.log('Error: getRoom request failed', err, msg);
            });
    },
    onGetUsers: function() {
        var self = this;
        return reqwest('//' + self.state.domain + '/users/')
            .then(function(resp) {
                for (var uid in resp) {
                    if (resp.hasOwnProperty(uid)) {
                        Actions.addUser(uid, resp[uid]);
                    }
                }
            }, function(err, msg) {
                console.log('Error: getUsers request failed', err, msg);
            });
    },
    onAddUser: function(uid, user) {
        this.state.users[uid] = user;
        this.trigger({
            users: this.state.users
        });
    },
    onAddSelf: function(user) {
        this.state.self = user;
        this.state.currentRoom = "global";
        this.trigger({
            self: this.state.self,
            currentRoom: this.state.currentRoom
        });
    },
    onRemoveUser: function(uid) {
        delete this.state.users[uid];
        this.trigger({
            users: this.state.users
        });
    },
    onNewRoom: function(name) {
        this.sock.send(JSON.stringify({
            "cmd": "addrm",
            "txt": name,
        }));
    },
    onJoinRoom: function(rid) {
        this.sock.send(JSON.stringify({
            "cmd": "sub",
            "rid": rid,
        }));
    },
    onLeaveRoom: function(rid) {
        this.sock.send(JSON.stringify({
            "cmd": "unsub",
            "rid": rid,
        }));
    },
    onAddRoom: function(rid, roomObj) {
        if (!this.state.rooms.hasOwnProperty(rid)) {
            this.state.rooms[rid] = {
                chatlog: [],
                name: roomObj.name,
                id: roomObj.id,
                subscribers: roomObj.subscribers ? roomObj.subscribers : {},
                owner: roomObj.owner ? roomObj.owner : "",
            };
        } else {
            this.state.rooms[rid].subscribers = roomObj.subscribers;
        }
        this.trigger({
            rooms: this.state.rooms
        });
    },
    onRemoveRoom: function(rid) {
        if (this.state.rooms.hasOwnProperty(rid)) {
            delete this.state.rooms[rid];
            if (this.state.currentRoom === rid) {
                this.switchCurrentRoom();
            }
            this.trigger({
                rooms: this.state.rooms
            });
        }
    },
    onSwitchRooms: function(rid) {
        if (this.state.rooms.hasOwnProperty(rid)) {
            this.state.currentRoom = rid;
        }
        this.trigger({
            currentRoom: this.state.currentRoom
        });
    },
    onCloseRoom: function(rid) {
        this.sock.send(JSON.stringify({
            cmd: "remvrm",
            rid: rid,
        }));
    },
    onAddChat: function(chat) {
        var room = this.state.rooms[chat.rid];
        if (room) {
            room.chatlog.push(chat);

            if (room.chatlog.length > 20) {
                room.chatlog.shift();
            }
            this.trigger({
                rooms: this.state.rooms
            });
        }
    },
    onSetDomain: function(domain) {
        this.state.domain = domain;
        this.trigger({
            domain: this.state.domain
        });
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
                case "welcome":
                    Actions.addSelf(chatblast.user);
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
                case "newrm":
                    Actions.addRoom(chatblast.room.id, chatblast.room);
                    break;
                case "closing":
                    Actions.removeRoom(chatblast.rid);
                    break;
            }
        } catch (e) {

        }
    },
});