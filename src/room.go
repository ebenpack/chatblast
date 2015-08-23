package chatblast

import (
	"log"
	"sync"
)

type Room struct {
	sync.RWMutex
	Name        string
	Id          string
	Private     bool
	Owner       *User
	Subscribers map[string]*User
	Channel     chan *Message
}

func (r *Room) GetSubscriber(userId string) (*User, bool) {
	r.RLock()
	defer r.RUnlock()
	user, ok := r.Subscribers[userId]
	return user, ok
}

func (r *Room) SetSubscriber(userId string, u *User) {
	r.Lock()
	defer r.Unlock()
	r.Subscribers[userId] = u
}

func (r *Room) RemoveSubscriber(userId string) {
	r.Lock()
	defer r.Unlock()
	delete(r.Subscribers, userId)
}

func NewRoom(name string, owner *User) *Room {
	newRoom := &Room{
		Name:        name,
		Id:          GUID(),
		Owner:       owner,
		Subscribers: map[string]*User{},
		Channel:     make(chan *Message),
	}
	go newRoom.Listen()
	log.Println("New room", name, "created")
	return newRoom
}

func (r *Room) Listen() {
	for incoming := range r.Channel {
		log.Println("Message sent in room", r.Name)
		for _, user := range r.Subscribers {
			user.Tell(incoming)
		}
	}
}

func (r *Room) Broadcast(msg *Message) {
	r.Channel <- msg
}

func (r *Room) Whisper(msg *Message, userId string) {
	whisperee, ok := r.Subscribers[userId]
	if ok {
		whisperee.Tell(msg)
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
	r.SetSubscriber(u.Id, u)
	msg := &Message{
		Cmd:    "join",
		RoomId: r.Id,
		UserId: u.Id,
	}
	r.Broadcast(msg)
}

func (r *Room) Leave(u *User) {
	r.RemoveSubscriber(u.Id)
	msg := &Message{
		Cmd:    "leave",
		RoomId: r.Id,
		UserId: u.Id,
	}
	r.Broadcast(msg)
}

func (r *Room) CloseRoom(u *User) (closed bool, err error) {
	closed = false
	err = nil
	if r.Owner != nil && u.Id == r.Owner.Id {
		closed = true
		msg := &Message{
			Cmd:    "closing",
			RoomId: r.Id,
		}
		r.Broadcast(msg)
	}
	return closed, err

}
