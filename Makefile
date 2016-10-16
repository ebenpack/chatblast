all:
	go get github.com/gorilla/websocket
	npm install --prefix ./static/js/
	npm run-script build --prefix ./static/js/
	go fmt
	go build
