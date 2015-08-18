package chatblast

type Message struct {
	Cmd    string `json:"cmd,omitempty"`
	Msg    string `json:"msg,omitempty"`
	RoomId string `json:"rid,omitempty"`
	UserId string `json:"uid,omitempty"`
}