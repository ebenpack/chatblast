package chatblast

import "time"
import "log"

type Room struct {
	Name        string          `json:"name,omitempty"`
	Id          string          `json:"id,omitempty"`
	IsPublic    bool            `json:"isPublic,omitempty"`
	Owner       *User           `json:"-"`
	Admins      map[*User]bool  `json:"admins,omitempty"`
	Subscribers map[*User]bool  `json:"subscribers,omitempty"`
	Invitees    map[*User]bool  `json:"-"`
	Channel     chan *Chatblast `json:"-"`
}

func NewRoom(name string) *Room {
	newRoom := &Room{
		Name:        name,
		Id:          GUID(),
		Admins:      map[*User]bool{},
		Subscribers: map[*User]bool{},
		Invitees:    map[*User]bool{},
		Channel:     make(chan *Chatblast),
	}
	go newRoom.RoomListener()
	return newRoom
}

func NewUserRoom(name string, user *User) *Room {
	newRoom := &Room{
		Name:        name,
		Id:          GUID(),
		Admins:      map[*User]bool{user: true},
		Subscribers: map[*User]bool{user: true},
		Invitees:    map[*User]bool{},
		Channel:     make(chan *Chatblast),
	}
	go newRoom.RoomListener()
	return newRoom
}

func (r *Room) RoomListener() {
	for incoming := range r.Channel {
		for sub, _ := range r.Subscribers {
			sub.connection.WriteJSON(incoming)
		}
	}
}

func (r *Room) Broadcast(msg *Chatblast) {
	log.Println(msg)
	r.Channel <- msg
}

func (r *Room) GetAdmins() []User {
	adminArray := make([]User, 0)
	for admin, _ := range r.Admins {
		adminArray = append(adminArray, *admin)
	}
	return adminArray
}

func (r *Room) GetUsers() []User {
	userArray := make([]User, 0)
	for user, _ := range r.Subscribers {
		userArray = append(userArray, *user)
	}
	return userArray
}

//func (r *Room) AddAdmin(admin *User) {
//	r.Admins[admin] = true
//}

//func (r *Room) RemoveAdmin(admin *User) {
//	delete(r.Admins, admin)
//	if len(r.Admins) == 0 {
//		r.CloseRoom()
//	}
//}

//func (r *Room) Invite(inviter *User, invitee *User) {

//}
//func (r *Room) AcceptInvite(inviter *User, invitee *User) {
//	for sub, _ := range r.Subscribers {
//		msg := Chatblast{Cmd: "logoff"}
//		sub.Channel <- &msg
//	}
//}
//func (r *Room) DeclineInvite(inviter *User, invitee *User) {
//	for sub, _ := range r.Subscribers {
//		msg := Chatblast{Cmd: "logoff"}
//		sub.Channel <- &msg
//	}
//}

func (r *Room) Subscribe(u *User) {
	log.Println("Login:", u)
	r.Subscribers[u] = true
	now := time.Now().Unix()
	msg := Chatblast{Cmd: "sub", Usr: *u, Room: r.Id, Time: now}
	r.Broadcast(&msg)
}

func (r *Room) Unsubscribe(u *User) {
	now := time.Now().Unix()
	msg := Chatblast{Cmd: "unsub", Usr: *u, Room: r.Id, Time: now}
	r.Broadcast(&msg)
	delete(r.Subscribers, u)
}

func (r *Room) CloseRoom() {
	defer close(r.Channel)
	for sub, _ := range r.Subscribers {
		msg := Chatblast{Cmd: "closing"}
		sub.Channel <- &msg
	}
}
