var gestionaContenidos = {

  navegadorNoCompatible : function() {
    var contNoComp = document.createElement("div");
//    contNoComp.id = "cont_no_compatible";
    contNoComp.className = "caja_texto_izquierda";
    contNoComp.classList.add("error_inicio");
    contNoComp.innerHTML = "<p>¡Lo sentimos!</p>";
    contNoComp.innerHTML += "<p>Webmission, para poder guardar los archivos que te envían en tu disco duro, "+
        "utiliza una técnica (<a href='http://www.w3.org/TR/file-system-api/'>API Filesystem de Javascript</a>) no compatible con tu navegador.</p>";
    contNoComp.innerHTML += "<p>Actualmente, sólo tiene soporte en <a href='http://caniuse.com/#feat=filesystem'>Chrome, Chromium y Opera</a></p>";
    this.eliminarElemento("cont_izquierda");
    this.eliminarElemento("cont_actividad");
    document.getElementById("main_container").appendChild(contNoComp);
  },

  salaLlena : function() {
    var contSalaLlena = document.createElement("div");
    contSalaLlena.className = "caja_texto_izquierda";
    contSalaLlena.classList.add("error_inicio");
    contSalaLlena.innerHTML = "<p>¡Lo sentimos!</p>";
    contSalaLlena.innerHTML += "<p>La sala privada a la que has intentado conectarte no admite más participantes</p>";
    contSalaLlena.innerHTML += "<p>Asegúrate de haber escrito bien la clave en la barra de direcciones</p>";
    this.eliminarElemento("cont_izquierda");
    this.eliminarElemento("cont_actividad");
    document.getElementById("main_container").appendChild(contSalaLlena);
  },

  iniciador: function() {
    var botonIniciar = document.createElement("a");

      botonIniciar.innerHTML = "Iniciar";
      botonIniciar.className = "boton";
      botonIniciar.classList.add("activo");
      botonIniciar.id = "btn_iniciar";

      document.getElementById("cont_texto_info").innerHTML = " <p>Bienvenido a Webmission</p>"+
            "<p>Para empezar a compartir un archivo, lo único que tienes que hacer es pulsar el "+ 
            "botón 'Iniciar'</p>";

      document.getElementById("cont_actividad").appendChild(botonIniciar);
      botonIniciar.addEventListener('click', function(event) {        
        window.location.hash = generaRandomHash(8);
        location.reload();
      });
  },

  muestraArchivoCargado : function(archivo) {
    var contInfoEnvia = document.getElementById("cont_info_envia");
    if(contInfoEnvia == undefined) {
      contInfoEnvia = document.createElement("div");
      contInfoEnvia.id = "cont_info_envia";  
    }
    
    contInfoEnvia.innerHTML = "<p>Nombre: "+archivo.name+"</p>" +
                            "<p>Tipo: "+archivo.type+"</p>" +
                            "<p>Tamaño: "+convierteBytes(archivo.size)+"</p>";

    gestionaContenidos.eliminarElemento("instruccion_input");
    document.getElementById("dropZone").appendChild(contInfoEnvia);
  },

  iniciadorCompartir : function() {
    
    this.ocultaEspera();

    var contTextoInfo = document.getElementById("cont_texto_info");

    contTextoInfo.innerHTML = "<p>¡Bien! Se acaba de crear una sala "+
    " privada a la cual únicamente tenéis acceso tú y la persona con la que quieras compartir.</p> " +
    " <p>Envíale el enlace que te mostramos aquí al lado e indícale que lo pegue "+
    " en la barra de direcciones del navegador (Chrome)</p>" +
    "<p>¡En cuanto lo haga, Webmission establecerá vuestra conexión P2P anónima!</p>";

    var contInfoEnlace = document.createElement("div");
    contInfoEnlace.id = "cont_info_enlace";
    var spanInfoEnlace = document.createElement("span");
    spanInfoEnlace.id = "enlace_compartir";
    spanInfoEnlace.innerHTML = window.location;
    var btnCopiarEnlace = document.createElement("span");
    btnCopiarEnlace.id = "btn_copiar_enlace";
    btnCopiarEnlace.className = "boton";
    btnCopiarEnlace.classList.add("activo");
    btnCopiarEnlace.innerHTML = "Copiar Enlace";
    btnCopiarEnlace.addEventListener("click", function() {
      prompt("Pulsa Ctrl + C, y luego Enter para copiar la URL en el portapapeles", window.location);
    }, false);


    contInfoEnlace.appendChild(spanInfoEnlace);
    contInfoEnlace.appendChild(btnCopiarEnlace);

    var contActividad = document.getElementById("cont_actividad");
    contActividad.appendChild(contInfoEnlace);
    
  },

  annadeBotonOfrecer : function() {
    var ofrecerBtn = document.getElementById("ofrecerBtn");

    if(ofrecerBtn == undefined) {
      ofrecerBtn = document.createElement("span");
      ofrecerBtn.id = "btn_ofrecer";
      ofrecerBtn.className = "boton";
      ofrecerBtn.classList.add("activo");
      ofrecerBtn.innerHTML = "Ofrecer";
      ofrecerBtn.addEventListener('click', ofrecerFichero, false);
      var divOfrecerBtn = document.createElement("div");
      divOfrecerBtn.id = "cont_ofrecer_btn";
      divOfrecerBtn.appendChild(ofrecerBtn); 

      var contInputArchivo = document.getElementById("cont_input");
      contInputArchivo.appendChild(divOfrecerBtn); 
    }
  },


  emisorCompartir : function() {
    var inputArchivo = document.createElement("input");
    inputArchivo.id= "inputArchivo";
    inputArchivo.type = "file";
    var divInputArchivo = document.createElement("div");
    divInputArchivo.id = "cont_input_archivo";
    divInputArchivo.appendChild(inputArchivo);
    divInputArchivo.style.display = "none";
  
    divInputArchivo.onchange = AuxiliaDnD.seleccionadoInput;

    var dropZone = document.createElement("div");
    dropZone.id = "dropZone";
    dropZone.className = "activo";
    var pIndica = document.createElement("p");
    pIndica.id = "instruccion_input";
    pIndica.innerHTML = "Haz click para elegir lo que quieras compartir, o arrástralo aquí dentro";

    dropZone.appendChild(pIndica);

    dropZone.addEventListener("dragover", AuxiliaDnD.preventDragover, false);

    dropZone.addEventListener("drop", AuxiliaDnD.cargaFicheroDnD, false);

    dropZone.addEventListener("click", AuxiliaDnD.onClickDropZone, false);

    var contInputArchivo = document.getElementById("cont_input");

    this.ocultaEspera();

    this.eliminarElemento("cont_info_enlace");

    document.getElementById("cont_texto_info").innerHTML = "<p>¡Conexión establecida!</p>" +
            "<p>Elige ahora el fichero que quieras compartir, y pulsa 'Ofrecer'</p>" +
            "<p>En cuanto sea aceptado tu ofrecimiento, comenzará el envío</p>";

    dropZone.appendChild(divInputArchivo);
    
    contInputArchivo.appendChild(dropZone);

    var contActividad = document.getElementById("cont_actividad");
    contActividad.appendChild(contInputArchivo);


    this.annadeChat();
    
  },

  annadeChat : function() {

    var contChat = document.createElement("div");
    contChat.id = "cont_chat";


    var contMensajes = document.createElement("div");
    contMensajes.id = "cont_mensajes";
    contMensajes.className = "caja_texto_izquierda";

    var contEscribirMensaje = document.createElement("div");
    contEscribirMensaje.id = "cont_escribir_mensaje";

    var inputMensaje = document.createElement("textarea");

    inputMensaje.id = "input_chat_texto";
    inputMensaje.className = "elem_sub_chat";
    inputMensaje.type = "text";
    inputMensaje.placeholder = "Escribe aquí";


    var enviarMensaje = document.createElement("a");
    enviarMensaje.id = "btn_enviar_mensaje";
    enviarMensaje.className = "elem_sub_chat";
    enviarMensaje.classList.add("inactivo");
    enviarMensaje.classList.add("boton");
    enviarMensaje.innerHTML = "Enviar mensaje";
    enviarMensaje.addEventListener("click", Chat.enviarMensaje, false);

    inputMensaje.onkeyup = function(evt) {
      if(inputMensaje.value == "") {
        enviarMensaje.classList.remove("activo");
        enviarMensaje.classList.add("inactivo");
      }
      else {
        if(evt.keyCode == 13) {
          Chat.enviarMensaje();
          return;
        }

        enviarMensaje.classList.remove("inactivo");
        enviarMensaje.classList.add("activo"); 
        
      }
      
    };

    contChat.appendChild(contMensajes);
    contEscribirMensaje.appendChild(inputMensaje);
    contChat.appendChild(contEscribirMensaje);
    contChat.appendChild(enviarMensaje);
    document.getElementById("cont_izquierda").appendChild(contChat);

  },

  receptorCompartir : function() {
    this.ocultaEspera();

    document.getElementById("cont_texto_info").innerHTML = "<p>¡Conexión establecida!</p>" +
        "<p>Espera a que te sea ofrecido el fichero y, si lo quieres, pulsa 'Recibir'</p> ";

    var cont_espera = document.createElement("div");
    cont_espera.id = "cont_espera_oferta";
    var img_espera = document.createElement("img");
    img_espera.src = "/images/esperando_oferta.GIF";
    img_espera.id = "img_espera_oferta";
    cont_espera.appendChild(img_espera);

    document.getElementById("cont_actividad").appendChild(cont_espera);


    this.annadeChat();    
  },

  emisorOfreciendo : function() {
    document.getElementById("cont_texto_info").innerHTML = "<p>Se está ofreciendo tu fichero. "+
            "En cuanto lo acepte, comenzará a enviarse.</p>";

  var dropZone = document.getElementById("dropZone");

  dropZone.classList.remove("activo");
  dropZone.classList.add("inactivo");

  dropZone.removeEventListener("dragover", AuxiliaDnD.preventDragover, false);
  dropZone.removeEventListener("drop", AuxiliaDnD.cargaFicheroDnD, false);
  dropZone.removeEventListener("click", AuxiliaDnD.onClickDropZone, false);

  this.eliminarElemento("btn_ofrecer");
            
  },

  emisorEnviando : function() {
    document.getElementById("cont_texto_info").innerHTML = "<p>Enviando fichero</p>"+
                            "<p>No cierres esta pestaña del navegador, o se cortará la conexión</p>";
    
    var btnCancelar = document.createElement("span");
    btnCancelar.className = "boton";    
    btnCancelar.id = "btn_cancelar";
    btnCancelar.addEventListener("click", controlTransmision.cancelarEnvio, false); 

    var btnPausaReanuda = document.createElement("div");
    btnPausaReanuda.className = "boton";  
    btnPausaReanuda.classList.add("pausa");
    btnPausaReanuda.classList.add("activo");  
    btnPausaReanuda.id = "btn_pausa_reanuda";
    btnPausaReanuda.addEventListener("click", controlTransmision.pausaReanudaEnvio, false); 

    var cont_actividad = document.getElementById("cont_actividad");

    var cont_progreso = document.createElement("div");
    cont_progreso.id = "cont_progreso";

    cont_progreso.appendChild(btnCancelar);

    cont_actividad.appendChild(cont_progreso);

    this.annadeBarraProgreso();
    cont_progreso.appendChild(btnPausaReanuda);
 
  },

  receptorRecibiendo : function() {
    document.getElementById("cont_texto_info").innerHTML = "<p>Recibiendo fichero</p>" + 
                      "<p><ul><li>Nombre: " + datosArchivo.nombre + "</li>"+
                            "<li> Tipo: " + datosArchivo.tipo + "</li>"+
                            "<li>Tamaño: " + convierteBytes(datosArchivo.tamanno) + "</li></p>";

    var btnCancelar = document.createElement("span");
    btnCancelar.id = "btn_cancelar";
    btnCancelar.classList.add("boton");
    btnCancelar.addEventListener("click", controlTransmision.cancelarRecepcion, false);

    var btnPausaReanuda = document.createElement("span");
    btnPausaReanuda.className = "boton";
    btnPausaReanuda.classList.add("pausa");
    btnPausaReanuda.classList.add("activo");    
    btnPausaReanuda.id = "btn_pausa_reanuda";
    btnPausaReanuda.addEventListener("click", controlTransmision.pausaReanudaRecepcion, false);

    this.eliminarElemento("btn_confirm_recibir");
    this.eliminarElemento("cont_espera_oferta");

    var cont_progreso = document.createElement("div");
    cont_progreso.id = "cont_progreso";

    document.getElementById("cont_actividad").appendChild(cont_progreso);

    cont_progreso.appendChild(btnCancelar);

    this.annadeBarraProgreso();

    cont_progreso.appendChild(btnPausaReanuda);

  },

  muestraEspera : function() {
    document.getElementById("cont_espera").display = "block";
    console.log("muestra espera");
  },

  ocultaEspera : function() {
    document.getElementById("cont_espera").display = "none";
  },

  infoFicheroARecibir : function(datos) {

    this.eliminarElemento("cont_espera_oferta");

    var contTexto = document.getElementById("cont_texto_info");
    contTexto.innerHTML = "<p>Te están ofreciendo el siguiente fichero: "+                      
                            "<p><ul><li>Nombre: " + datos.nombre + "</li>"+
                            "<li>Tipo: " + datos.tipo + "</li>"+
                            "<li>Tamaño: " + convierteBytes(datos.tamanno) + "</li></ul></p>" +
                            "<p>Pulsa 'Recibir' para comenzar a recibirlo</p>";

    var contActividad = document.getElementById("cont_actividad");

    var botonConfirm = document.createElement("span");
    botonConfirm.id = "btn_confirm_recibir";
    botonConfirm.classList.add("boton");
    botonConfirm.innerHTML = "Recibir";

    botonConfirm.addEventListener("click", function(){
      //initFileSystem(datosArchivo.tamanno, datosArchivo.nombre);
      FilesystemOb.initFileSystem(datosArchivo.tamanno, datosArchivo.nombre);
    }, false);
    
    contActividad.appendChild(botonConfirm);
   
  },

  annadeBarraProgreso : function() {
    barraProgreso = document.createElement("progress");
    barraProgreso.value = 0;
    barraProgreso.max = 100;
    barraProgreso.id = "barraProgreso";
    textoProgreso = document.createElement("span");
    textoProgreso.id = "textoProgreso";

    var cont_barra = document.createElement("div");
    cont_barra.id = "cont_barra_progreso";

    cont_barra.appendChild(barraProgreso);
    cont_barra.appendChild(textoProgreso);

    document.getElementById("cont_progreso").appendChild(cont_barra);

  },

  avisoCancelado : function() {
    document.getElementById("cont_texto_info").innerHTML = "<p>El envío ha sido cancelado por ti</p>";
    this.eliminaControles();
    
    this.eliminarElemento("cont_progreso");
  
  },

  avisoCanceladoOtro : function() {
    document.getElementById("cont_texto_info").innerHTML = "<p>El envío ha sido cancelado por el otro usuario</p>";
    this.eliminaControles();

    this.eliminarElemento("cont_progreso");
  },

  eliminaControles : function() {
    this.eliminarElemento("cont_controles");
  },

  envioCompletado : function() {
    document.getElementById("cont_texto_info").innerHTML = "<p>¡El envío ha sido completado!</p>";
    this.eliminarElemento("btn_cancelar");
    this.eliminarElemento("btn_pausa_reanuda");
    this.eliminaControles();
  },

  canalCerrado : function() {
    this.vaciarElemento("cont_actividad");

    var inputTexto = document.getElementById("input_chat_texto");
    inputTexto.onkeyup = function(){};
    inputTexto.disabled = "disabled";
    document.getElementById("btn_enviar_mensaje").removeEventListener("click", Chat.enviarMensaje);

    var avisoChat = document.createElement("div");
    avisoChat.className = "aviso_chat";
    avisoChat.innerHTML = "--- Conexión cerrada ---";

    document.getElementById("cont_mensajes").appendChild(avisoChat);

    var contAvisoCerrado = document.createElement("div");
    contAvisoCerrado.id = "cont_aviso_cerrado";

    contAvisoCerrado.innerHTML = "¡La conexión se ha cortado!";

    document.getElementById("cont_texto_info").innerHTML = "<p>Parece ser que el canal de datos P2P ha sido cerrado.</p>" +
              "<p>Aunque puede haber pasado por varios motivos, lo más probable es que el otro usuario haya cerrado su ventana del navegador.</p>"+
              "<p>Intentad establecer una nueva conexión de la misma manera que antes y, si aún así no fuera posible, dentro de unos minutos.</p>";

    document.getElementById("cont_actividad").appendChild(contAvisoCerrado);
  },

  eliminarElemento : function(idElemento) {
    var elemento = document.getElementById(idElemento);
    if(elemento){
      elemento.parentNode.removeChild(elemento);
    }
  },

  vaciarElemento : function(idElemento) {
    var elemento = document.getElementById(idElemento);
    while(elemento.firstChild) {
      elemento.removeChild(elemento.firstChild);
    }
  }

  

};