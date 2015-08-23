package chatblast

import (
	"github.com/gorilla/websocket"
	"log"
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

func (u *User) Tell(msg *Message) {
	u.Channel <- msg
}

func NewUser(name string, conn *websocket.Conn) *User {
	newUser := &User{
		Name:    name,
		Id:      GUID(),
		RoomId:  "global",
		Channel: make(chan *Message),
		Conn:    conn,
	}
	log.Println("New user", name, "created")
	go newUser.Listen()
	return newUser
}
