const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');


app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, console.log(`Server started on port ${PORT}: http://localhost:${PORT}`));

const io = require('socket.io')(server);

io.sockets.on('connection', newConnection);
function newConnection (socket) {
 console.log('new connection ' + socket.id)

 socket.on('mouse', data => {
   socket.broadcast.emit('mouse', data)
 })
}