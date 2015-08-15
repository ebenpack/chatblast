package chatblast

type Room struct {
	Name string `json:"name,omitempty"`
	Id  string `json:"id,omitempty"`
	Admins  string `json:"-"`
	Subscribers  []User `json:"text,omitempty"`
}
