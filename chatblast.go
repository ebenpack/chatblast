package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type msgIncomingData struct {
	Image string `json:"img,omitempty"`
	Text  string `json:"text,omitempty"`
}

type msgIncoming struct {
	Data []msgIncomingData `json:"data,omitempty"`
	Type string            `json:"type,omitempty"`
}

type usr struct {
	Name       string          `json:"name"`
	connection *websocket.Conn `json:"-"`
}

type chatblast struct {
	Msg  []msgIncomingData `json:"msg,omitempty"`
	Cmd  string            `json:"cmd,omitempty"`
	Usr  usr               `json:"user,omitempty"`
	Time int64             `json:"time,omitempty"`
}

type sockethub struct {
	users     map[usr]bool
	broadcast chan chatblast
}

// Make a single global hub to
// keep track of connected users, and to
// keep our message channel
var h = sockethub{
	make(map[usr]bool),
	make(chan chatblast),
}

func chatblaster() {
	// Rebroadcast any messages coming through
	// the channel to all connected users
	for incoming := range h.broadcast {
		start := time.Now()
		for user := range h.users {
			user.connection.WriteJSON(incoming)
		}
		elapsed := time.Since(start)
		log.Println("Bam! Chatblast! Only took ", elapsed, " amounts of time!")

	}
}

func sockhandler(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("origin")
	// Check to see if request is from same origin
	if strings.Contains(r.Host, origin) {
		emptyResponse := []byte{}
		w.WriteHeader(403)
		w.Write(emptyResponse)
		return
	}

	// Get user name
	var name string
	nameArr := r.URL.Query()["name"]
	var now int64
	if len(nameArr) == 0 || nameArr[0] == "" {
		return
	} else {
		name = nameArr[0]
	}

	// Upgrade connection to websockets
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Make user
	self := usr{Name: name, connection: conn}
	h.users[self] = true

	// Register some teardown
	defer func() {
		now = time.Now().Unix()
		h.broadcast <- chatblast{Cmd: "logoff", Usr: self, Time: now}
		delete(h.users, self)
		conn.Close()
	}()

	now = time.Now().Unix()

	// Broadcast a login notice
	h.broadcast <- chatblast{Cmd: "login", Usr: self, Time: now}

	// Read incomining requests from connected client, and
	// broadcast to all other connected clients
	for {
		var err error
		_, p, err := conn.ReadMessage()
		if err != nil {
			return
		}
		now = time.Now().Unix()

		// Parse out JSON request
		var msg msgIncoming
		err = json.Unmarshal(p, &msg)
		if err != nil {
			// TODO Return some kind of error message
			// to the client only
			log.Println(err)
			log.Println("Bad JSON")
		}
		h.broadcast <- chatblast{Cmd: "incoming", Msg: msg.Data, Usr: self, Time: now}

	}

}

func handler(w http.ResponseWriter, r *http.Request) {
	// Serve up an HTML template to bootstrap everything
	t, _ := template.ParseFiles("chatblast.html")
	err := t.Execute(w, r.Host)
	if err != nil {
		log.Println("uh oh!")
	}
}

func jsHandler(w http.ResponseWriter, r *http.Request) {
	// Serve some static JS files
	log.Println("jshandler")
	log.Println(r.URL.Path[1:])
	http.ServeFile(w, r, r.URL.Path[1:])
}

func init() {
	// Register our handlers
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/", handler)
	http.Handle("/js/", http.FileServer(http.Dir(dir)))
	http.HandleFunc("/sock", sockhandler)
}

func main() {
	// Kick off just a single goroutine to
	// act as a rebroadcaster for all messages
	go chatblaster()
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	}
}
