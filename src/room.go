package chatblast

import (
	"log"
)

type Room struct {
	Name        string
	Id          string
	Private     bool
	Owner       *User
	Subscribers map[string]*User
}

func NewRoom(name string, owner *User) *Room {
	room := &Room{
		Name:        name,
		Id:          GUID(),
		Owner:       owner,
		Subscribers: map[string]*User{},
	}
	return room
}

func (r *Room) Broadcast(msg *Message) {
	for _, user := range r.Subscribers {
		user.Channel <- msg
	}
}

func (r *Room) Whisper(msg *Message, userId string) {
	whisperee, ok := r.Subscribers[userId]
	if ok {
		whisperee.Channel <- msg
	}
}

func (r *Room) RequestInvite(u *User) {
	msg := &Message{
		Cmd:    "inviterequest",
		RoomId: r.Id,
		UserId: u.Id,
	}
	r.Owner.Channel <- msg
}

func (r *Room) Join(u *User) {
	r.Subscribers[u.Id] = u
	msg := &Message{
		Cmd:    "join",
		RoomId: r.Id,
		UserId: u.Id,
	}
	r.Broadcast(msg)
}

func (r *Room) Leave(u *User) {
	delete(r.Subscribers, u.Id)
	msg := &Message{
		Cmd:    "leave",
		RoomId: r.Id,
		UserId: u.Id,
	}
	log.Println(r)
	r.Broadcast(msg)
}