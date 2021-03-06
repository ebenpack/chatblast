package chatblast

type messageData struct {
	Name  string `json:"name,omitempty"`
	Value string `json:"value,omitempty"`
}

type Message struct {
	Msg       []messageData `json:"data,omitempty"`
	Text      string        `json:"txt,omitempty"`
	Cmd       string        `json:"cmd,omitempty"`
	Time      int64         `json:"time,omitempty"`
	RoomId    string        `json:"rid,omitempty"`
	UserId    string        `json:"uid,omitempty"`
	Whisperee *User         `json:"whisperee,omitempty"`
	User      *User         `json:"user,omitempty"`
	Room      *Room         `json:"room,omitempty"`
}
