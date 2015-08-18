package chatblast

/*
 * It really knows how to control a room...
 */

type RoomController struct {
	// Map of room Ids to rooms
	Rooms map[string]*Room
	// Map of user Ids to users
	Users   map[string]*User
	Channel chan *Message
}

func MakeRoomController() *RoomController {
	rc := &RoomController{
		Rooms:   make(map[string]*Room),
		Users:   make(map[string]*User),
		Channel: make(chan *Message),
	}
	// Add global (ownerless) room
	rc.Rooms["global"] = &Room{
		Name:        "Global",
		Id:          "global",
		Subscribers: map[string]*User{},
	}
	go rc.Listen()
	return rc
}

func (rc *RoomController) AddRoom(name string, u *User) {
	id := GUID()
	newRoom := NewRoom(name, u)
	rc.Rooms[id] = newRoom
}

func (rc *RoomController) AddUser(u *User) {
	rc.Users[u.Id] = u
	rc.Subscribe(u, "global")
}

func (rc *RoomController) RemoveUser(u *User) {
	delete(rc.Users, u.Id)
	rc.Unsubscribe(u, u.RoomId)
}

func (rc *RoomController) Subscribe(u *User, roomId string) {
	room, ok := rc.Rooms[roomId]
	if ok {
		room.Join(u)
		u.RoomId = roomId
	}
}

func (rc *RoomController) Unsubscribe(u *User, roomId string) {
	room, ok := rc.Rooms[roomId]
	if ok {
		room.Leave(u)
		u.RoomId = ""
	}
}

func (rc *RoomController) Broadcast(msg *Message) {
	// TODO Message dispatch
	rc.Channel <- msg
}

func (rc *RoomController) GetUsers(roomId string) []*User {
	var userArray []*User
	room, ok := rc.Rooms[roomId]
	if ok {
		for _, user := range room.Subscribers {
			userArray = append(userArray, user)
		}
	}
	return userArray
}

func (rc *RoomController) Listen() {
	for incoming := range rc.Channel {
		room, ok := rc.Rooms[incoming.RoomId]
		if ok {
			room.Broadcast(incoming)
		}
	}
}
