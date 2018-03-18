


var configuracionStun = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};
// {"url":"stun:stun.services.mozilla.com"}
   
var iniciador;
var sala;

var finEnvioCompleto = false;

var ultimoChunkGuardado;



function initMain() {


  var compruebaUrl = function(){
    if(window.location.hash === '') {
      gestionaContenidos.iniciador();
    }
    else {
      sala = window.location.hash;
      gestionaContenidos.muestraEspera();
      conexionServidorSennalizacion();
      annadeTurn();

      GestorSala.compruebaEnSala(); 
    }
  };

  var annadeTurn = function(){
    if(location.hostname !== 'localhost' || location.hostname != '127.0.0.1') {
      configuracionStun.iceServers.push({
            // visto en : https://groups.google.com/forum/#!topic/easyrtc/32d9ZKc_66E
             'url' : 'turn:numb.viagenie.ca:3478',
             'username' : 'vilchesvalle@gmail.com',
             'credential' : 'webmission'
      });
    
    }
  };

  var conexionServidorSennalizacion = function() {
    GestorConexion.socket = io.connect("ws://pruebas-webmission.rhcloud.com:8000");

  };

  if(FilesystemOb.estaDisponibleFileSystem()) {
    compruebaUrl();  
  }
  else {
    console.log("no disponible");
    gestionaContenidos.navegadorNoCompatible();
  }
  

}


var controlTransmision = {
  cancelarEnvio : function() {
    envioCancelado = true;

    var mensajeCancelaEnvio = {
      envioCancelado : true
    };

    GestorConexion.dataChannel.send(JSON.stringify(mensajeCancelaEnvio));
    gestionaContenidos.avisoCancelado();

    console.log("envio cancelado");
  },
  cancelarRecepcion : function() {
    
    var mensajeCancelaRecepcion = {
      recepcionCancelada : true
    };

    GestorConexion.dataChannel.send(JSON.stringify(mensajeCancelaRecepcion));
    gestionaContenidos.avisoCancelado();

    FilesystemOb.eliminarDirectorioDescarga();
    //eliminarDirectorioDescarga();

    console.log("recepción cancelada");

  },

  pausaReanudaRecepcion : function() {
    var btn = document.getElementById("btn_pausa_reanuda");
    var mensaje = {
      pausaReanudaRecepcion : true,
      pausa : false,
      reanuda : false
    };
    if(btn.classList.contains("pausa")) {
      btn.classList.remove("pausa");
      btn.classList.add("reanuda");
      mensaje.pausa = true;
    }
    else {
      btn.classList.remove("reanuda");
      btn.classList.add("pausa");
      mensaje.reanuda = true;      
    }
    GestorConexion.dataChannel.send(JSON.stringify(mensaje));
  },

  pausaReanudaEnvio : function() {
    var btn = document.getElementById("btn_pausa_reanuda");
    var mensaje = {
      pausaReanudaEnvio : true,
      pausa : false,
      reanuda : false
    };
    if(btn.classList.contains("pausa")) {
      btn.classList.remove("pausa");
      btn.classList.add("reanuda");
      mensaje.pausa = true;
      envioDetenido = true;
    }
    else {
      btn.classList.remove("reanuda");
      btn.classList.add("pausa");
      mensaje.reanuda = true;
      envioDetenido = false;
      enviarFichero(ultimoChunkGuardado+1);      
    }
    GestorConexion.dataChannel.send(JSON.stringify(mensaje));
  }

};


var Chat = {
  enviarMensaje : function() {
    var inputTexto = document.getElementById("input_chat_texto");
    var mensaje = inputTexto.value;

    mensaje = mensaje.trim();

    if(mensaje){

      var jsonMensajeChat = {
        chatTexto : true,
        mensajeTexto : mensaje
      };

      Chat.recibeMensaje(mensaje, "emisor");
      inputTexto.value = "";

      var btnEnviar = document.getElementById("btn_enviar_mensaje");
      btnEnviar.classList.remove("activo");
      btnEnviar.classList.add("inactivo");
      
      GestorConexion.dataChannel.send(JSON.stringify(jsonMensajeChat));

    }
  },

  recibeMensaje : function(texto, rol) {
    var contMensaje = document.createElement("div");
    var pTexto = document.createElement("p");

    switch(rol) {
      case "receptor" : contMensaje.className = "mensaje receptor"; break;
      case "emisor" : contMensaje.className = "mensaje emisor"; break;
      case "aplicacion" : contMensaje.className = "mensaje aplicacion"; break;
    }

    pTexto.innerHTML = texto;
    var divClear = document.createElement("div");
    divClear.className = "clear";

    contMensaje.appendChild(pTexto);

    var contMensajes = document.getElementById("cont_mensajes");

    contMensajes.appendChild(contMensaje);
    contMensajes.appendChild(divClear);
    contMensajes.scrollTop = contMensajes.scrollHeight;
  }


};










var arrayToStoreChunks = [];

var confirmado = false;
var dataConfirm = null;
var datosArchivo = {
  nombre : null,
  extension: null,
  tipo : null,
  tamanno : null
};

var recibeDataChannel = function(channel) {

    // canal abierto
    channel.onopen = function () {
        console.log('CANAL ABIERTO A CASCOPORRO');
        if(iniciador) {
          gestionaContenidos.emisorCompartir();
        }
        else {
          gestionaContenidos.receptorCompartir();
        }
    };

    // canal cerrado 
    channel.onclose = function(evt) {
      console.log("canal cerrado");
      if(!finEnvioCompleto) {
        gestionaContenidos.canalCerrado();  
      }      
    };

    // recibimos mensaje por el datachannel
    channel.onmessage = function(mensaje) {

        var data = JSON.parse(mensaje.data);

        if(data.chatTexto === true) {
         // procesaMensajeChat(data.mensajeTexto, "receptor");
         Chat.recibeMensaje(data.mensajeTexto, "receptor");
        }


        // se ha aceptado el envío
        if(data.confirm === true) {
        //  console.log("comenzarEnvio");
          enviarFichero();
          gestionaContenidos.emisorEnviando();
        }

        // primer mensaje: datos del archivo
        // solicitamos confirmación  
        if(data.metadatosPreEnvio === true) {
          procesaRecibido.metadatosPreEnvio(data);
          //procesaMetadatosPreEnvio(data);
          
        }

        if(data.chunkGuardado === true) {
          ultimoChunkGuardado = data.numChunk;
          console.log(ultimoChunkGuardado);
          if(ultimoChunkGuardado+1 < data.totalChunks) {
            enviarFichero(ultimoChunkGuardado+1);
          }
          actualizaBarraProgreso(ultimoChunkGuardado, data.totalChunks);
        }

     
        if(confirmado && data.chunkFichero) {
          //procesarDatosArchivo(data);
          procesaRecibido.datosArchivo(data);
        }

        if(data.envioCancelado === true) {
          FilesystemOb.eliminarDirectorioDescarga();
          //eliminarDirectorioDescarga();
          gestionaContenidos.avisoCanceladoOtro();
        }

        if(data.recepcionCancelada === true) {
          envioDetenido = true;
          gestionaContenidos.avisoCanceladoOtro();
        }


        
        if(data.pausaReanudaEnvio === true) {
          var btnControl = document.getElementById("btn_pausa_reanuda");
          if(data.pausa) {
            console.log("pausar envío desde emisor");
            
            btnControl.removeEventListener("click",controlTransmision.pausaReanudaRecepcion ,false);
            btnControl.classList.remove("activo");
            btnControl.classList.add("inactivo");

          }
          else {
            console.log("reanudar envío desde emisor");
            btnControl.addEventListener("click",controlTransmision.pausaReanudaRecepcion ,false);
            btnControl.classList.remove("inactivo");
            btnControl.classList.add("activo");  
          }         
        }

        if(data.pausaReanudaRecepcion === true) {
          var btnControl = document.getElementById("btn_pausa_reanuda");
          if(data.pausa) {
            console.log("pausar envío desde receptor");
            envioDetenido = true;
            
            btnControl.removeEventListener("click",controlTransmision.pausaReanudaEnvio ,false);
            btnControl.classList.remove("activo");
            btnControl.classList.add("inactivo");

          }
          else {
            console.log("reanudar envío desde receptor");
            envioDetenido = false;
            enviarFichero(ultimoChunkGuardado+1);
            btnControl.addEventListener("click",controlTransmision.pausaReanudaEnvio ,false);
            btnControl.classList.remove("inactivo");
            btnControl.classList.add("activo");  
          }          
        }


        if(data.envioCompletado === true) {
          finEnvioCompleto = true;
          gestionaContenidos.envioCompletado();
        }


    };        
};


var confirmRecibirArchivo = function() {
    confirmado = true;
    dataConfirm = {'confirm' : true};
    GestorConexion.dataChannel.send(JSON.stringify(dataConfirm));

    gestionaContenidos.receptorRecibiendo();

};

var recibidoYaOfrecimiento = false;


/*
https://gist.github.com/borismus/1032746
http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
http://blog.danguer.com/2011/10/24/base64-binary-decoding-in-javascript/
http://vabate.com/convert-a-base64-encoded-string-to-binary-with-javascript/
http://support.sas.com/documentation/cdl/en/lestmtsref/67407/HTML/default/viewer.htm#p1ndnmptyw8uo4n1uqibu1ybwtkk.htm
http://www.nczonline.net/blog/2009/12/08/computer-science-in-javascript-base64-encoding/
*/



var procesaRecibido = {

  datosArchivo : function(objetoRecibido) {
    arrayToStoreChunks.push(objetoRecibido.data);

    var metadatosChunk = objetoRecibido.metadataChunk;

    ultimoChunk = metadatosChunk.ultimoChunk;

    if(metadatosChunk.ultimaParteChunk) {

      actualizaBarraProgreso(metadatosChunk.numChunk, metadatosChunk.totalChunks);

    //  saveFile(arrayToStoreChunks, metadatosChunk);
    FilesystemOb.guardarArchivo(arrayToStoreChunks, metadatosChunk);

      arrayToStoreChunks = null;
      arrayToStoreChunks = [];
    }

  },

  metadatosPreEnvio : function(metadatos) {
    if(!recibidoYaOfrecimiento) {
      datosArchivo.nombre = metadatos.nombre;
      datosArchivo.extension = metadatos.extension;
      datosArchivo.tipo = metadatos.tipo;
      datosArchivo.tamanno = metadatos.tamanno;

      recibidoYaOfrecimiento = true;
      gestionaContenidos.infoFicheroARecibir(datosArchivo);
    }
  }


};

