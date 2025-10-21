
var serverUrl = 'https://affsoft.ca';
serverUrl = 'http://localhost:8080';

var clientId = ":"+Math.random()+"_"+Date.now();

var socket;

var global_update_freq = 20;//<= 333ms if the game is running at 60fps


function connectSocket() {
    socket = io(serverUrl, {
        transports: ['websocket'],
        withCredentials: false,
        query: {
            clientId: clientId,
            username: currentUsername
        }
    });

    socket.on('connect', () => {
        //log('Connected to socket server');
    });

    socket.on('matched', (data) => {
        // log('Matched with: ' + JSON.stringify(data));
        // document.getElementById('gameId').value = data.gameId;
    });

    socket.on('disconnect', () => {
        //log('Socket disconnected');
    });
}


function sendPlayerUpdate(updateData) {
    if (socket && socket.connected) {
        socket.emit('player-update', {
            clientId: clientId,
            username: currentUsername,
            update: updateData
        });
    }
}




        
async function testPint() {
    let noww = Date.now();
    const res = await fetch(`${serverUrl}/api/tping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  })
    });

    const data = await res.json();
    noww = Date.now() - noww;
    //log('Ping respon: ' + noww + ' ms');
    document.getElementById('acutalopinlocation').innerHTML = 'Ping: ' + noww + 'ms';
}
