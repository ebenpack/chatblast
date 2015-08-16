# chatblast

A fairly straightforward realtime-ish chat thingy, using websockets, go, and react.

Currently supports in-message images via drag'n'drop. Will possibly support other things in the future, as they are conceived of.

## Installing / setup


1. `git clone https://github.com/ebenpack/chatblast.git`
2. `go get github.com/gorilla/websocket`
3. `cd chatblast`
4. `make`
5. `./chatblast`
6. `google-chrome --app=localhost:8080` (or just open localhost:8080 in your browser of choice)
7. Start blasting! Blast a chat! With friends! Blast your friends!

## API (unstable)

### Send Message

    {
        "type":"msg",
        "room": "baa6723e-e92e-4b79-bf0e-b539f477404a",
        "data":[
            {"text": "Look at this cat picture!"},
            {"img": "http://imgur.com/xHidGEf"},
            {"text": "And this one!"},
            {"img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAXVBMVEX///8AAAD+/v7V1dXg4OCoqKjCwsLS0tLY2Nh0dHSOjo4KCgqYmJhmZmbj4+NFRUUeHh5RUVEpKSk6Ojq5ubk1NTWGhob39/fw8PBMTEyjo6OxsbFaWlrFxcUuLi4DeDIRAAAAcElEQVQYlY1PyRaAIAh0tFBbtWxf/v8zS/J16tBcgGGAQYgfkFJIjjHjZNJPx8xJopcqhhVbImj340EFkL+K9kRESIQ5HdfPyL25KKkC6gYtX8zg4HvA1bdGxevbgASXsyerTcc1Kfu6zSjorxd+4QLp+wNlUvhWUwAAAABJRU5ErkJggg=="}
        ]
    }

### Receive Message

    {
        "cmd": "msg",
        "room": "baa6723e-e92e-4b79-bf0e-b539f477404a",
        "msg":[
            {"text": "Look at this cat picture!"},
            {"img": "http://imgur.com/xHidGEf"},
            {"text": "And this one!"},
            {"img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAXVBMVEX///8AAAD+/v7V1dXg4OCoqKjCwsLS0tLY2Nh0dHSOjo4KCgqYmJhmZmbj4+NFRUUeHh5RUVEpKSk6Ojq5ubk1NTWGhob39/fw8PBMTEyjo6OxsbFaWlrFxcUuLi4DeDIRAAAAcElEQVQYlY1PyRaAIAh0tFBbtWxf/v8zS/J16tBcgGGAQYgfkFJIjjHjZNJPx8xJopcqhhVbImj340EFkL+K9kRESIQ5HdfPyL25KKkC6gYtX8zg4HvA1bdGxevbgASXsyerTcc1Kfu6zSjorxd+4QLp+wNlUvhWUwAAAABJRU5ErkJggg=="}
        ],
        "user": {"name": "David Lo Pan"},
        "time": 1439730841
    }
