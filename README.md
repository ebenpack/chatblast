# chatblast

A fairly straightforward ephemeral realtime-ish chat thingy, using websockets, go, and react.

Currently supports:

* In-message images via drag'n'drop
* Multiple rooms

Will possibly support other things in the future, as they are conceived of and implemented.

## Installing / setup

1. `git clone https://github.com/ebenpack/chatblast.git`
2. `go get github.com/gorilla/websocket`
3. `cd chatblast`
4. `make`
5. `./chatblast`
6. `google-chrome --app=localhost:8080` (or just open localhost:8080 in your browser of choice)
7. Start blasting! Blast a chat! With friends! Blast your friends!