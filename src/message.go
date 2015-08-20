package chatblast

type messageData struct {
	Image string `json:"img,omitempty"`
	Text  string `json:"text,omitempty"`
}

type Message struct {
	Msg    []messageData `json:"data,omitempty"`
	Cmd    string        `json:"cmd,omitempty"`
	RoomId string        `json:"rid,omitempty"`
	UserId string        `json:"uid,omitempty"`
}
