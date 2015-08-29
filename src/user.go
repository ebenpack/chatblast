package chatblast

import (
	"github.com/gorilla/websocket"
	"log"
)

type User struct {
	Name    string          `json:"name,omitempty"`
	Id      string          `json:"id,omitempty"`
	Channel chan *Message   `json:"-"`
	Conn    *websocket.Conn `json:"-"`
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
		Channel: make(chan *Message),
		Conn:    conn,
	}
	log.Println("New user", name, "created")
	go newUser.Listen()
	return newUser
}
