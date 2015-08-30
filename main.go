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

// Instantiate global roomcontroller
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

	// Make user, kick off channel listener,
	// and add them to globalRoom
	self := chatblast.NewUser(name)
	go func(u *chatblast.User, conn *websocket.Conn) {
		for incoming := range u.Channel {
			conn.WriteJSON(incoming)
		}
	}(self, conn)
	globalRC.AddUser(self)

	// Register some teardown
	defer func() {
		globalRC.RemoveUser(self)
		conn.Close()
	}()

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
			incoming.UserId = self.Id
			incoming.User = self
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
	rooomsJSON, err := json.Marshal(globalRC.Rooms)
	if err != nil {
		log.Println("Error serializing rooms")
		log.Println(err)
	} else {
		w.Write(rooomsJSON)
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
	http.HandleFunc("/rooms", roomshandler)
	http.HandleFunc("/users", usershandler)
	http.Handle("/js/", http.FileServer(http.Dir(dir)))
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
