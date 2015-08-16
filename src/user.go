package chatblast

import (
	"github.com/gorilla/websocket"
)

type User struct {
	Name       string           `json:"name,omitempty"`
	Id         string           `json:"id,omitempty"`
	Subscribed map[string]*Room `json:"-"`
	//	Invited    map[*Room]bool  `json:"-"`
	//	Admin      map[*Room]bool  `json:"-"`
	Channel    chan *Chatblast `json:"-"`
	connection *websocket.Conn `json:"-"`
}

func (u *User) SendMessage(msg *Chatblast, roomName string) {
	room, ok := u.Subscribed[roomName]
	if ok {
		room.Broadcast(msg)
	}
}

func (u *User) Subscribe(room *Room) {
	room.Subscribe(u)
	u.Subscribed[room.Name] = room
}

func (u *User) Unsubscribe(room *Room) {
	room.Unsubscribe(u)
	delete(u.Subscribed, room.Name)
}

func (u *User) MakeRoom(roomName, id string) {
	u.Subscribed[roomName] = NewUserRoom(roomName, id, u)
}

func (u *User) Logoff() {
	for _, room := range u.Subscribed {
		room.CloseRoom()
	}
}
