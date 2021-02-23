const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')
const io = require('socket.io')(http)

const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'))
})

class Chat {
    constructor(){
        this.users = new WeakMap()
    }
    push(socket, user) {
        this.users.set(socket, user)
    }
}

class User {
    constructor(nickname, color){
        this.nickname = nickname
        this.textColor = color
    }
}

var wm = new WeakMap();

const emojis = {
    ':-)': '😄',
    ';-)': '😉',
    ':|' : '😐',
    ':-(': '😒',
    ':-O': '😲',
};

io.on('connection', (socket) => {
    console.log(`Se ha conectado un usuario con el id ${socket.id}`);
    
    socket.on('connected', (nickname) => {
        const user = new User(nickname, 'blue')
        wm.set(socket, user)
        socket.broadcast.emit('welcome', `Se ha conectado ${ wm.get(socket).nickname }`)
    })

    socket.on('chat message', (msg) => {
        msg = Object.keys(emojis).forEach(emoji => {
            msg.replace(emoji, emojis[emoji])
        });
        const message = `${ wm.get(socket).nickname }: ${msg}`
        io.emit('chat message', message);
    });
})

http.listen(port, () => {
    console.log(`App listening on the port ${port}`)
})