all:
	go get github.com/gorilla/websocket
	npm --prefix static/js/ install
	npm build
	go fmt
	go build
