package chatblast

import (
	"github.com/gorilla/websocket"
)

type User struct {
	Name    string
	Id      string
	RoomId  string // RoomId for the room a user is currently in
	Channel chan *Message
	Conn    *websocket.Conn
}

func (u *User) Listen() {
	for incoming := range u.Channel {
		u.Conn.WriteJSON(incoming)
	}
}

func NewUser(name string, conn *websocket.Conn) *User {
	newUser := &User{
		Name:    name,
		Id:      GUID(),
		RoomId:  "global",
		Channel: make(chan *Message),
		Conn:    conn,
	}
	go newUser.Listen()
	return newUser
}