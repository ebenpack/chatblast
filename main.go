// main.go
package main

import (
	"./src"
	"encoding/json"
	"errors"
	"github.com/gorilla/websocket"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Instantiate global roomcontroller
var globalRC = chatblast.MakeRoomController(100, 100)

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
	ok := globalRC.AddUser(self)

	// Register some teardown
	defer func() {
		globalRC.RemoveUser(self)
		conn.Close()
	}()

	if !ok {
		// Global user limit exceeded
		conn.WriteJSON(chatblast.Message{
			Cmd:  "err",
			Text: "global user limit reached.",
		})
		return
	}

	// Read incomining requests from connected client, and
	// broadcast to roomcontroller
	for {
		var err error
		_, p, err := conn.ReadMessage()
		if err != nil {
			return
		}

		// Parse out JSON request
		var incoming chatblast.Message
		err = json.Unmarshal(p, &incoming)
		if err != nil {
			incoming.Cmd = "err"
			incoming.Text = "Bad JSON"
			self.Tell(&incoming)
		} else {
			incoming.User = self
			incoming.Time = time.Now().Unix()
			globalRC.Broadcast(&incoming)
		}
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

func debughandler(w http.ResponseWriter, r *http.Request) {
	// Serve up an HTML template to bootstrap everything
	t, _ := template.ParseFiles("html/debug.html")
	err := t.Execute(w, r.Host)
	if err != nil {
		log.Println("uh oh!")
	}
}

func roomshandler(w http.ResponseWriter, r *http.Request) {
	// Return a JSON object with information about all open rooms
	w.Header().Set("Content-Type", "application/json")
	var roomsJSON []byte
	var err error
	// There's a leading slash, so strip out the first (empty) item
	path := strings.Split(r.URL.Path, "/")[1:]
	if r.URL.Path == "/rooms/" {
		roomsJSON, err = json.Marshal(globalRC.Rooms)
	} else if log.Println(len(path)); len(path) == 2 {
		if room, ok := globalRC.GetRoom(path[1]); ok {
			roomsJSON, err = json.Marshal(room)
		} else {
			err = errors.New("Room not found")
		}
	} else {
		err = errors.New("Path not found")
	}
	if err != nil {
		http.NotFound(w, r)
	} else {
		w.Write(roomsJSON)
	}
}

func usershandler(w http.ResponseWriter, r *http.Request) {
	// Return a JSON object with information about all connected users
	w.Header().Set("Content-Type", "application/json")
	usersJSON, err := json.Marshal(globalRC.Users)
	if err != nil {
		log.Println("Error serializing users")
		log.Println(err)
	} else {
		w.Write(usersJSON)
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
	http.HandleFunc("/debug", debughandler)
	http.HandleFunc("/rooms/", roomshandler)
	http.HandleFunc("/users/", usershandler)
	http.Handle("/static/", http.FileServer(http.Dir(dir)))
	http.HandleFunc("/sock", sockhandler)
}

func main() {
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		panic("ListenAndServe: " + err.Error())
	} else {
		log.Println("Serving on")
	}
}
