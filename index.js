const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidV4 } = require('uuid');

let rooms = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {rooms});
});

app.post('/rooms', (req, res) => {
    const room = {
        id: uuidV4(),
        name: req.body.name,
        users: []
    }

    rooms.push(room);
    io.to('lobby').emit('rooms-changed', rooms);

    res.redirect(`/rooms/${room.id}`);
});

app.get('/rooms/:roomId', (req, res) => {
    const room = findRoomById(req.params.roomId);

    if(room){
        res.render('rooms', {room});
    } else {
        res.redirect('/');
    }
    
});


io.on('connection', socket => {
    socket.join('lobby');

    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        let room = findRoomById(roomId);
        room.users.push(userId);

        io.to('lobby').emit('rooms-changed', rooms);

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);

            removeUser(room, userId);

            if(room.users.lenght === 0){
                removeRoom(roomId);
            }

            io.to('lobby').emit('rooms-changed', rooms);
        })
    });
});

server.listen(3000);



function findRoomById(roomId){
    return rooms.find(room => room.id === roomId);
}

function removeUser(room, userId){
    const index = room.users.indexOf(userId);
    if(index > -1){
        room.users.splice(index, 1);
    }
}

function removeRoom(roomId){
    const index = rooms.findIndex(room => room.id === roomId);
    if(index > -1){
        rooms.splice(index, 1);
    }
}