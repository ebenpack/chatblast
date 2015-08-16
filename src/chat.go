package chatblast

type msgIncomingData struct {
	Image string `json:"img,omitempty"`
	Text  string `json:"text,omitempty"`
}

type msgIncoming struct {
	Data []msgIncomingData `json:"data,omitempty"`
	Type string            `json:"type,omitempty"`
	Room string            `json:"room,omitempty"`
}

type Chatblast struct {
	Msg  []msgIncomingData `json:"msg,omitempty"`
	Cmd  string            `json:"cmd,omitempty"`
	Usr  User              `json:"user,omitempty"`
	Time int64             `json:"time,omitempty"`
}
