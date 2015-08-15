# chatblast

A fairly straightforward realtime chat thingy, using websockets, go, and react.

Currently supports in-message images via drag'n'drop. Will possibly support other things in the future, as they are conceived of.

## Installing / setup


1. `git clone https://github.com/ebenpack/chatblast.git`
2. `go get github.com/gorilla/websocket`
3. `cd chatblast/js`
4. `npm install`
5. `gulp build`
6. `cd ..`
7. `go build`
8. `./chatblast`
9. `google-chrome --app=localhost:8080` (or just open localhost:8080 in your browser of choice)
10. Start blasting! Blast a chat! With friends!