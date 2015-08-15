all:
	go get github.com/gorilla/websocket
	npm --prefix js/ install
	gulp --gulpfile js/gulpfile.js build
	go fmt
	go build