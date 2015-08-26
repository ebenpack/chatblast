package chatblast

type messageData struct {
	Name string `json:"name,omitempty"`
	Value  string `json:"value,omitempty"`
}

type Message struct {
	Msg    []messageData `json:"data,omitempty"`
	Text   string        `json:"text,omitempty"`
	Cmd    string        `json:"cmd,omitempty"`
	RoomId string        `json:"rid,omitempty"`
	UserId string        `json:"uid,omitempty"`
	User   *User         `json:"-"`
}
