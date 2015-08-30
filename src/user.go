package chatblast

import (
	"log"
	"time"
)

type User struct {
	Name      string          `json:"name,omitempty"`
	Id        string          `json:"id,omitempty"`
	Connected int64           `json:"connected,omitempty"`
	Channel   chan *Message   `json:"-"`
}

func (u *User) Tell(msg *Message) {
	u.Channel <- msg
}

func NewUser(name string) *User {
	now := time.Now().Unix()
	newUser := &User{
		Name:      name,
		Id:        GUID(),
		Connected: now,
		Channel:   make(chan *Message),
	}
	log.Println("New user", name, "created")
	return newUser
}
