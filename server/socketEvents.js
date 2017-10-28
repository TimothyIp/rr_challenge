exports = module.exports = function(io) {
  //Set Listeners
  io.on('connection', (socket)=> {
    console.log('a user has connected');

    socket.on('enter channel', (channel, username) => {
      socket.join(channel);
      io.sockets.in(channel).emit('user joined', `${username} has joined the channel`)
      console.log('user has joined channel' , channel, username)
    });

    socket.on('leave channel', (channel) => {
      socket.leave(channel);
      console.log('user has left channel')
    });
    
    socket.on('new message', (socketMsg) => {
      io.sockets.in(socketMsg.channel).emit('refresh messages', socketMsg);
      console.log('new message received in channel', socketMsg)
    });

    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });
}