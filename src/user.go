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

func NewUser(name string, conn *websocket.Conn) *User {
	newUser := &User{
		Name:       name,
		Id:         GUID(),
		Subscribed: map[string]*Room{},
		Channel:    make(chan *Chatblast),
		connection: conn,
	}
	go newUser.UserListener()
	return newUser
}

func (u *User) UserListener() {
	for incoming := range u.Channel {
		u.connection.WriteJSON(incoming)
	}
}

func (u *User) SendMessage(msg *Chatblast) {
	room, ok := u.Subscribed[msg.Room]
	if ok {
		room.Broadcast(msg)
	}
}

func (u *User) Subscribe(room *Room) {
	u.Subscribed[room.Id] = room
	room.Subscribe(u)

}

func (u *User) Unsubscribe(room *Room) {
	room.Unsubscribe(u)
	delete(u.Subscribed, room.Id)
}

func (u *User) MakeRoom(name string) {
	newRoom := NewUserRoom(name, u)
	u.Subscribed[newRoom.Id] = newRoom
}

func (u *User) Logoff() {
	for _, room := range u.Subscribed {
		room.Unsubscribe(u)
	}
}
