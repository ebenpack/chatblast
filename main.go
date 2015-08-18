// main.go
package main

import (
	"./src"
	"encoding/json"
	"github.com/gorilla/websocket"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var globalRC = chatblast.MakeRoomController()

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
	if len(nameArr) == 0 || nameArr[0] == "" {
		return
	} else {
		name = nameArr[0]
	}

	// Upgrade connection to websockets
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	// Make user and add them to globalRoom
	self := chatblast.NewUser(name, conn)
	globalRC.AddUser(self)

	// Register some teardown
	defer func() {
		globalRC.RemoveUser(self)
		conn.Close()
	}()

	// Read incomining requests from connected client, and
	// broadcast to all other connected clients
	for {
		var err error
		_, p, err := conn.ReadMessage()
		if err != nil {
			return
		}

		log.Println(globalRC.GetUsers("global"))
		// Parse out JSON request
		var incoming chatblast.Message
		err = json.Unmarshal(p, &incoming)
		incoming.UserId = self.Id
		incoming.RoomId = self.RoomId
		if err != nil {
			// TODO Return some kind of error message
			// to the client only
			log.Println(err)
			log.Println("Bad JSON")
		}
		globalRC.Broadcast(&incoming)
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

func main() {
	// Kick off just a single goroutine to
	// act as a rebroadcaster for all messages
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	} else {
		log.Println("Serving on")
	}
}
