package chatblast

/*
 * It really knows how to control a room...
 */

import (
	"log"
	"sync"
)

type RoomController struct {
	// Map of room Ids to rooms
	Rooms     map[string]*Room
	RoomsLock sync.RWMutex
	// Map of user Ids to users
	Users     map[string]*User
	UsersLock sync.RWMutex
	Channel   chan *Message
}

func MakeRoomController() *RoomController {
	rc := &RoomController{
		Rooms:     make(map[string]*Room),
		RoomsLock: sync.RWMutex{},
		Users:     make(map[string]*User),
		UsersLock: sync.RWMutex{},
		Channel:   make(chan *Message),
	}
	log.Println("New RoomController created")
	// Add global (ownerless) room
	globalRoom := &Room{
		Name:        "Global",
		Id:          "global",
		Subscribers: map[string]*User{},
		Channel:     make(chan *Message),
	}
	log.Println("New room Global created")
	go globalRoom.Listen()

	rc.SetRoom("global", globalRoom)
	go rc.Listen()
	return rc
}

func (rc *RoomController) GetRoom(roomId string) (*Room, bool) {
	rc.RoomsLock.RLock()
	defer rc.RoomsLock.RUnlock()
	room, ok := rc.Rooms[roomId]
	return room, ok
}

func (rc *RoomController) SetRoom(roomId string, room *Room) {
	rc.RoomsLock.Lock()
	defer rc.RoomsLock.Unlock()
	rc.Rooms[roomId] = room
}

func (rc *RoomController) DeleteRoom(roomId string) {
	rc.RoomsLock.Lock()
	defer rc.RoomsLock.Unlock()
	delete(rc.Rooms, roomId)
}

func (rc *RoomController) GetUser(userId string) (*User, bool) {
	rc.UsersLock.RLock()
	defer rc.UsersLock.RUnlock()
	user, ok := rc.Users[userId]
	return user, ok
}

func (rc *RoomController) SetUser(userId string, u *User) {
	rc.UsersLock.Lock()
	defer rc.UsersLock.Unlock()
	rc.Users[userId] = u
}

func (rc *RoomController) DeleteUser(userId string) {
	rc.UsersLock.Lock()
	defer rc.UsersLock.Unlock()
	delete(rc.Users, userId)
}

func (rc *RoomController) AddRoom(name string, u *User) {
	newRoom := NewRoom(name, u)
	rc.SetRoom(newRoom.Id, newRoom)
	rc.Subscribe(u, newRoom.Id)
	msg := &Message{
		RoomId: "global",
		Cmd:    "newrm",
		Text:   name,
	}
	rc.Dispatch(msg)
	log.Println("New room", name, "created")
}

func (rc *RoomController) RemoveRoom(rid string, u *User) {
	room, ok := rc.GetRoom(rid)
	if ok {
		closed, err := room.CloseRoom(u)
		if err != nil {
			log.Println("Uh oh!")
		} else if closed {
			rc.DeleteRoom(rid)
			log.Println("Room", room.Name, "deleted")
		} else {
			msg := &Message{
				Cmd:    "err",
				Text:   "Room could not be closed.",
				RoomId: rid,
			}
			u.Tell(msg)
		}
	}
}

func (rc *RoomController) AddUser(u *User) {
	log.Println("New user", u.Name, "added to RoomController")
	rc.SetUser(u.Id, u)
	rc.Subscribe(u, "global")
}

func (rc *RoomController) RemoveUser(u *User) {
	rc.DeleteUser(u.Id)
	rc.Unsubscribe(u, u.RoomId)
	log.Println("User", u.Name, "removed from RoomController")
}

func (rc *RoomController) Subscribe(u *User, roomId string) {
	room, ok := rc.GetRoom(roomId)
	if ok {
		room.Join(u)
	}
	log.Println("User", u.Name, "subscribed to", room.Name)
}

func (rc *RoomController) Unsubscribe(u *User, roomId string) {
	room, ok := rc.GetRoom(roomId)
	if ok {
		room.Leave(u)
		u.RoomId = ""
	}
	log.Println("User", u.Name, "unsubscribed from", room.Name)
}

func (rc *RoomController) Broadcast(msg *Message) {
	// TODO Message dispatch
	rc.Channel <- msg
}

func (rc *RoomController) GetUsers(roomId string) []*User {
	var userArray []*User
	room, ok := rc.GetRoom(roomId)
	if ok {
		for _, user := range room.Subscribers {
			userArray = append(userArray, user)
		}
	}
	return userArray
}

func (rc *RoomController) Dispatch(incoming *Message) {
	switch incoming.Cmd {
	case "sub":
		rc.Subscribe(incoming.User, incoming.RoomId)
	case "unsub":
		rc.Unsubscribe(incoming.User, incoming.RoomId)
	case "addrm":
		rc.AddRoom(incoming.Text, incoming.User)
	case "remvrm":
		rc.RemoveRoom(incoming.RoomId, incoming.User)
	default:
		room, ok := rc.GetRoom(incoming.RoomId)
		if ok {
			room.Broadcast(incoming)
		}
	}
}

func (rc *RoomController) Listen() {
	for incoming := range rc.Channel {
		rc.Dispatch(incoming)
	}
}
