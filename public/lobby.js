const socket = io('/');
const roomList = document.getElementById('room-list');

socket.on('rooms-changed', rooms => {
    roomList.innerHTML = '';

    rooms.forEach(room => {
        roomList.innerHTML += `<li><a href="/rooms/${room.id}">(${room.users.length}) ${room.name}</a></li>`;
    });
})