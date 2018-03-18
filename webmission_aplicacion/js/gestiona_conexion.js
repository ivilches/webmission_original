var iniciador = false;


var GestorSala = {
  compruebaEnSala : function() {
    if(sala !== undefined) {
      GestorConexion.socket.emit('crear o entrar', sala);  


      this.escuchaMensajes();

    }
  },

  escuchaMensajes : function() {
    GestorConexion.socket.on('salaCreada', function (mensaje) {
      console.log("Creada sala "+ mensaje.sala);
      iniciador = true;
      gestionaContenidos.iniciadorCompartir();
    });

    GestorConexion.socket.on('llena', function(mensaje){
      console.log("Sala "+mensaje+" no admite más clientes");
      gestionaContenidos.salaLlena();
    });

    GestorConexion.socket.on("entrar", function(mensaje){
      console.log("Petición de otro cliente para unirse a la sala");

    });


    GestorConexion.socket.on('entrado', function (mensaje) {
      console.log('Has entrado en la sala');
      iniciador = false;
    });

    GestorConexion.socket.on('preparadosParaConexion', function () {
        GestorConexion.crearConexionP2P(iniciador, configuracionStun);
        console.log("creada conexión");
    });



    GestorConexion.socket.on('message', function (mensaje){
        GestorConexion.procesarMensajesConexion(mensaje);
    });

  }

};




var GestorConexion = {

  conexP2P : null,
  dataChannel: null,
  socket : null,

// envío de mensajes al servidor para la negociación
  enviarMensajeConex : function(mensaje) {
   console.log('Mensaje cliente ' + mensaje);
   this.socket.emit('message', sala, mensaje);
  },

  procesarMensajesConexion : function(mensaje) {
    if (mensaje.type === 'offer') {
        console.log('Offer. Enviando answer');
        this.conexP2P.setRemoteDescription(new RTCSessionDescription(mensaje), function(){}, this.logError);
        this.conexP2P.createAnswer(this.crearSesionLocal, this.logError);

    } else if (mensaje.type === 'answer') {
        console.log('Answer.');
        this.conexP2P.setRemoteDescription(new RTCSessionDescription(mensaje), function(){}, this.logError);

    } else if (mensaje.type === 'candidate') {
        this.conexP2P.addIceCandidate(new RTCIceCandidate({candidate: mensaje.candidate}));
    }

  },

  crearConexionP2P : function(iniciador, config) {
    if(iniciador) {
      console.log("Creando conexión como iniciador");
    }
    else {
      console.log("Creando conexión como invitado");
    }

    this.conexP2P = new RTCPeerConnection(config);

    this.conexP2P.onicecandidate = function (event) {
        if (event.candidate) {
            GestorConexion.enviarMensajeConex({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            });
        } 
    };

    if (iniciador) {
        this.dataChannel = this.conexP2P.createDataChannel("webmission");
        recibeDataChannel(this.dataChannel);

        this.conexP2P.createOffer(this.crearSesionLocal, this.logError);

    } else {
        this.conexP2P.ondatachannel = function (event) {
            GestorConexion.dataChannel = event.channel;
           // console.log("ln 287", this.dataChannel);
            recibeDataChannel(GestorConexion.dataChannel);
        };
    }


  },

  crearSesionLocal : function(desc) {
    GestorConexion.conexP2P.setLocalDescription(desc, function () {
        console.log('Sesión local '+ GestorConexion.conexP2P.localDescription);
        GestorConexion.enviarMensajeConex(GestorConexion.conexP2P.localDescription);
    }, this.logError);
  },

  logError : function(error) {
    console.log("Error: " + error);
  }




};