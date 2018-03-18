
var FilesystemOb = {
	vars : {
		fs : null,
		root : null,
		flagInicio : true,
		nombreDirectorio : ""
	},

	estaDisponibleFileSystem : function() {
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		if(window.requestFileSystem) {
			return true;
		}
		return false;
	},

	initFileSystem : function(tamannoSolicitado, nombre) {
		var tamannoDefecto = 1024*1024*1024;
	    var tamanno = (tamannoSolicitado > tamannoDefecto)  ? tamannoSolicitado : tamannoDefecto;

	    navigator.webkitPersistentStorage.requestQuota(tamanno,
	      function(tamannoConcedido) {

	        // Request a file system with the new size.
	        window.requestFileSystem(window.PERSISTENT, tamannoConcedido, function(fs) {


	          // Set the filesystem variable.
	          FilesystemOb.vars.fs = fs;

	          FilesystemOb.vars.root = fs.root;

	          // crear directorio con nombre del archivo
	          FilesystemOb.crearDirectorio(nombre);

	          // inicializamos reader
	    //      dirReader = FilesystemOb.vars.root.createReader();

//	          confirmRecibirArchivo();

	        }, FilesystemOb.manejaError);

	      }, FilesystemOb.manejaError);
	},	

	crearDirectorio : function(nombre) {
		var nombreLimpio = nombre.split(".")[0];

		FilesystemOb.vars.root.getDirectory("webmission", {create:true},
	      function(dirEntry) {
	        FilesystemOb.vars.root.getDirectory("webmission/"+nombreLimpio, {create:true},
	          function(dirEntry) {
	            FilesystemOb.vars.nombreDirectorio = "webmission/"+nombreLimpio;
	            console.log(FilesystemOb.vars.nombreDirectorio);
	            confirmRecibirArchivo();
	          },
	          FilesystemOb.manejaError
	        );
	      },
	      FilesystemOb.manejaError
	    );

	},

	guardarArchivo : function(content, dataChunks) {

	  var crearArchivo = false;

	  if(FilesystemOb.vars.flagInicio) {
	    crearArchivo = true;
	    flagInicio = false;    
	  }


	  FilesystemOb.vars.root.getFile(FilesystemOb.vars.nombreDirectorio+"/1.wak", {create:crearArchivo}, function(fileEntry){

	    fileEntry.createWriter(function(writer){

	      writer.onwriteend = function() {

	        ultimoChunkGuardado = dataChunks.numChunk;

	        var mensajeGuardado = {
	          chunkGuardado : true,
	          numChunk : ultimoChunkGuardado,
	          totalChunks : dataChunks.totalChunks
	        };

	        GestorConexion.dataChannel.send(JSON.stringify(mensajeGuardado));

	        if(dataChunks.ultimoChunk) {
	          finEnvioCompleto = true;
	          var mensajeCompletado = {
	            envioCompletado : true
	          };
	          GestorConexion.dataChannel.send(JSON.stringify(mensajeCompletado));
	          gestionaContenidos.eliminarElemento("btn_cancelar");
	          gestionaContenidos.eliminarElemento("btn_pausa_reanuda");
	          FilesystemOb.creaEnlace();
	        }
	      };

	      writer.onerror = FilesystemOb.manejaError;

	      writer.seek(writer.length);

	      var arrayProv = content.join('');
	      var binary = atob(arrayProv.split(',')[1]);

	      var array = [];

	      for(var j=0; j < binary.length; j++) {
	        array.push(binary.charCodeAt(j));
	      }
	    
	      var contentBlob = new Blob([new Uint8Array(array)], {type: datosArchivo.tipo});

	      console.log(datosArchivo.tipo);

	      writer.write(contentBlob);


	    }, FilesystemOb.manejaError ) ;

	  }, FilesystemOb.manejaError);

	},

	creaEnlace : function() {
	  FilesystemOb.vars.root.getFile(FilesystemOb.vars.nombreDirectorio+"/1.wak", {create:false},
	      function(fileEntry) {
	         var hyperlink = document.createElement('a');
	         hyperlink.id = "enlace_descarga";
	         hyperlink.href = fileEntry.toURL();
	         hyperlink.target = '_blank';
	         hyperlink.download = datosArchivo.nombre; //+ "." + datosArchivo.extension;

	        var mouseEvent = new MouseEvent('click', {
	            view: window,
	            bubbles: true,
	            cancelable: true
	        });

	        hyperlink.innerHTML = "Descargar Archivo";

	        var cont_enlace = document.createElement("div");
	        cont_enlace.id = "cont_enlace_descarga";
	        cont_enlace.appendChild(hyperlink);

	        document.getElementById("cont_actividad").appendChild(cont_enlace);

		    (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
		  },
	      FilesystemOb.manejaError
    	);
	},

	manejaError : function(error) {
	  var message = '';

	  switch (error.code) {
	    case FileError.SECURITY_ERR:
	      message = 'Security Error';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      message = 'Not Found Error';
	      break;
	    case FileError.QUOTA_EXCEEDED_ERR:
	      message = 'Quota Exceeded Error';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      message = 'Invalid Modification Error';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      message = 'Invalid State Error';
	      break;
	    default:
	      message = 'Unknown Error';
	      break;
	  }

	  console.log(message);
	},

	eliminarDirectorioDescarga : function() {
		var nombreDir = FilesystemOb.vars.nombreDirectorio;
		FilesystemOb.vars.root.getDirectory(nombreDir, {create:false}, function(dirEntry){
	    	dirEntry.removeRecursively(function(){}, FilesystemOb.errorHandler);
	  	});
	}



};













