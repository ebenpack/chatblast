package chatblast

import (
	"log"
	"time"
)

type Connection interface {
	WriteJSON(v interface{}) error
}

type User struct {
	Name      string        `json:"name,omitempty"`
	Id        string        `json:"id,omitempty"`
	Connected int64         `json:"connected,omitempty"`
	Channel   chan *Message `json:"-"`
	Conn      Connection    `json:"-"`
}

func (u *User) Tell(msg *Message) {
	u.Channel <- msg
}

func (u *User) Listen() {
	for incoming := range u.Channel {
		u.Conn.WriteJSON(incoming)
	}
}

func NewUser(name string, conn Connection) *User {
	now := time.Now().Unix()
	newUser := &User{
		Name:      name,
		Id:        GUID(),
		Connected: now,
		Channel:   make(chan *Message),
		Conn: conn,
	}
	go newUser.Listen()
	msg := &Message{
		Cmd: "welcome",
		User: newUser,
	}
	newUser.Tell(msg)
	log.Println("New user", name, "created")
	return newUser
}
