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
	// TODO Only allow uniquely named rooms?
	newRoom := NewRoom(name, u)
	rc.SetRoom(newRoom.Id, newRoom)
	rc.Subscribe(u, newRoom.Id)
	msg := &Message{
		RoomId: "global",
		Cmd:    "newrm",
		Msg: []messageData{
			{Name: "rid", Value: newRoom.Id},
			{Name: "name", Value: name},
		},
	}
	rc.Dispatch(msg)
	log.Println("New room", name, "created")
}

func (rc *RoomController) RemoveRoom(rid string, u *User) {
	if room, ok := rc.GetRoom(rid); ok {
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
	for _, room := range rc.Rooms {
		if room.Owner == u {
			rc.RemoveRoom(room.Id, u)
		} else if _, ok := room.GetSubscriber(u.Id); ok {
			rc.Unsubscribe(u, room.Id)
		}
	}
	if global, ok := rc.GetRoom("global"); ok {
		msg := &Message{
			Cmd:    "logoff",
			UserId: u.Id,
			RoomId: "global",
		}
		global.Broadcast(msg)
	}
	log.Println("User", u.Name, "removed from RoomController")
}

func (rc *RoomController) Subscribe(u *User, roomId string) {
	if room, ok := rc.GetRoom(roomId); ok {
		room.Join(u)
		log.Println("User", u.Name, "subscribed to", room.Name)
	} else {
		msg := &Message{
			Cmd:  "err",
			Text: "Room does not exist",
		}
		u.Tell(msg)
	}
}

func (rc *RoomController) Unsubscribe(u *User, roomId string) {
	if room, ok := rc.GetRoom(roomId); ok {
		room.Leave(u)
		log.Println("User", u.Name, "unsubscribed from", room.Name)
	} else {
		msg := &Message{
			Cmd:  "err",
			Text: "Room does not seem to exist",
		}
		u.Tell(msg)
	}
}

func (rc *RoomController) Broadcast(msg *Message) {
	// TODO Message dispatch
	rc.Channel <- msg
}

//func (rc *RoomController) GetUsers(roomId string) []*User {
//	var userArray []*User
//	if room, ok := rc.GetRoom(roomId); ok {
//		for _, user := range room.Subscribers {
//			userArray = append(userArray, user)
//		}
//	}
//	return userArray
//}

//func (rc *RoomController) GetRooms(roomId string) []*Room {
//	var userArray []*User
//	if room, ok := rc.GetRoom(roomId); ok {
//		for _, user := range room.Subscribers {
//			userArray = append(userArray, user)
//		}
//	}
//	return userArray
//}

func (rc *RoomController) Dispatch(incoming *Message) {
	switch incoming.Cmd {
	case "sub":
		if incoming.RoomId != "" {
			rc.Subscribe(incoming.User, incoming.RoomId)
		} else {
			log.Println("Bad sub request")
		}
		// TODO error handling
	case "unsub":
		if incoming.RoomId != "" {
			rc.Unsubscribe(incoming.User, incoming.RoomId)
		} else {
			log.Println("Bad unsub request")
		}
		// TODO error handling
	case "addrm":
		if incoming.Text != "" {
			rc.AddRoom(incoming.Text, incoming.User)
		} else {
			log.Println("Bad addrm request")
		}
		// TODO error handling
	case "remvrm":
		if incoming.RoomId != "" {
			rc.RemoveRoom(incoming.RoomId, incoming.User)
		} else {
			log.Println("Bad remvrm request")
		}
		// TODO error handling
		//	case "wspr":
		//		TODO add whispers
	default:
		if room, ok := rc.GetRoom(incoming.RoomId); ok {
			room.Broadcast(incoming)
		}
	}
}

func (rc *RoomController) Listen() {
	for incoming := range rc.Channel {
		rc.Dispatch(incoming)
	}
}
