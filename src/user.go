package chatblast

import (
	"github.com/gorilla/websocket"
	"log"
	"time"
)

type User struct {
	Name    string          `json:"name,omitempty"`
	Id      string          `json:"id,omitempty"`
	Connected int64		`json:"connected,omitempty"`
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
	now := time.Now().Unix()
	newUser := &User{
		Name:    name,
		Id:      GUID(),
		Connected: now,
		Channel: make(chan *Message),
		Conn:    conn,
	}
	log.Println("New user", name, "created")
	go newUser.Listen()
	return newUser
}
