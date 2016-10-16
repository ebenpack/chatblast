all:
	go get github.com/gorilla/websocket
	npm --prefix static/js/ install
	npm --prefix static/js/ build
	go fmt
	go build
