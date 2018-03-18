
var os = require('os');
var nodeStatic = require('node-static');
var http = require('http');
var socketIO = require("socket.io");

var file = new(nodeStatic.Server)();


var port = process.env.OPENSHIFT_NODEJS_PORT || 8080 , 
    ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";


var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(port, ip);


var io = socketIO.listen(app);
var numClientes = null;


io.sockets.on('connection', function (socket){

  socket.on('message', function (room, message) {    
   // socket.broadcast.emit('message', message);
   socket.to(room).emit('message', message);
  });

  socket.on('crear o entrar', function (sala) {

  var roomMembers = [];
  console.log("Sala "+sala); 

  for (var member in io.sockets.adapter.rooms[sala]){
    roomMembers.push(member);
  }

  console.log(roomMembers.length);

// enviar sólamene mensajes a los de la sala propia

    switch(roomMembers.length) {
    case 0 : 
            socket.join(sala);
            socket.emit('salaCreada', {sala: sala, clientId: socket.id});
            break;
    case 1 :
            io.sockets.in(sala).emit('entrar', {sala: sala, clientId: socket.id});
            socket.join(sala);
            socket.emit('entrado', {sala: sala, clientId: socket.id});
            io.sockets.in(sala).emit('preparadosParaConexion');
            break;
    default:
            socket.emit('llena', sala);
            break;
   }


  });



});
