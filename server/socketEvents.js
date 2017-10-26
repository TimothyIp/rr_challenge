exports = module.exports = function(io) {
  //Set Listeners
  io.on('connection', (socket)=> {
    console.log('a user has connected');

    socket.on('enter a conversation', (conversation) => {
      socket.join(conversation);
      console.log('user has joined conversation' , conversation)
    });

    socket.on('leave conversation', (conversation) => {
      socket.leave(conversation);
      console.log('user has left conversation')
    });
    
    socket.on('new message', (conersation) => {
      io.sockets.in(conversation).emit('refresh messages', conversation);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected')
    });
  });
}