package chatblast

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

var globalRoom = NewRoom("Global", "GLOBAL")

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func sockhandler(w http.ResponseWriter, r *http.Request) {
	// Check to see if request is from same origin
	origin := r.Header.Get("origin")
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
	now = time.Now().Unix()
	self := &User{
		Name:       name,
		Subscribed: map[string]*Room{},
		connection: conn,
	}

	self.Subscribe(globalRoom)

	// Register some teardown
	defer func() {
		now = time.Now().Unix()
		globalRoom.Unsubscribe(self)
		conn.Close()
	}()

	userArray := globalRoom.GetUsers()
	log.Println(userArray)
	now = time.Now().Unix()

	// Read incomining requests from connected client, and
	// broadcast to all other connected clients
	for {
		var err error
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("bad!")
			return
		}
		now = time.Now().Unix()

		// Parse out JSON request
		var incoming msgIncoming
		err = json.Unmarshal(p, &incoming)
		if err != nil {
			// TODO Return some kind of error message
			// to the client only
			log.Println(err)
			log.Println("Bad JSON")
		}
		//
		msg := Chatblast{Cmd: "msg", Msg: incoming.Data, Usr: *self, Time: now}
		self.SendMessage(&msg, "Global")
	}

}

func handler(w http.ResponseWriter, r *http.Request) {
	// Serve up an HTML template to bootstrap everything
	t, _ := template.ParseFiles("html/chatblast.html")
	err := t.Execute(w, r.Host)
	if err != nil {
		log.Println("uh oh!")
	}
}

func jsHandler(w http.ResponseWriter, r *http.Request) {
	// Serve some static JS files
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

func Start() {
	// Kick off just a single goroutine to
	// act as a rebroadcaster for all messages
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	} else {
		log.Println("Serving on")
	}
}
