const videoGrid = document.getElementById('video-grid');

const video = document.createElement('video');
video.muted = true;

const socket = io('/');
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
});
const peers = {};

peer.on('open', userId => {
    socket.emit('join-room', ROOM_ID, userId);
});



navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(video, stream);

    peer.on('call', call => {
        call.answer(stream);

        const userVideo = document.createElement('video');
        call.on('stream', userStream => {
            addVideoStream(userVideo, userStream);
        })
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    socket.on('user-disconnected', userId => {
        if(peers[userId]) {
            peers[userId].close();
        }
    });
});



function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser(userId, stream){
    const call = peer.call(userId, stream);
    const userVideo = document.createElement('video');
    call.on('stream', userStream => {
        addVideoStream(userVideo, userStream);
    });
    call.on('close', () => {
        userVideo.remove();
    });

    peers[userId] = call;
}