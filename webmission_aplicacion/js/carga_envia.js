/*
  ARCHIVOS 
*/

if(window.File && window.FileReader 
   && window.FileList && window.Blob ){
  console.log("archivos");
}
else {
  console.log("no archivos");
}

var CHUNK_LENGTH = 1024*13;




var ofrecerFichero = function() {
  
  var archivo = document.getElementById("inputArchivo").files[0] || archivosDnD[archivosDnD.length-1]; 

  var metadatos = {
    metadatosPreEnvio : true,
    nombre : archivo.name,
    extension: archivo.name.split(".").pop(),
    tipo : archivo.type,
    tamanno : archivo.size
  };

  GestorConexion.dataChannel.send(JSON.stringify(metadatos));

  gestionaContenidos.emisorOfreciendo();

};

var trozoEmp = 0;
var trozoFin = 0;

var envioDetenido = false;


var enviarFichero = function(numChunk) {
  datosArchivo.file = document.getElementById("inputArchivo").files[0] || archivosDnD[0],
  fr = new FileReader,
  chunkSize = 1024*1024,
  chunkSizeReal = 0,
  chunk = numChunk || 0,
  chunks = Math.ceil(datosArchivo.file.size / chunkSize);
  
  console.log(chunk);


  var loadNext = function(numChunk) {


    if(envioDetenido){
      console.log("envio detenido");
      return;
    } 

     chunk = numChunk || 0;

     var start, end,
         blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice;

     start = chunk * chunkSize;
     end = start + chunkSize >= datosArchivo.file.size ? datosArchivo.file.size : start + chunkSize;

     trozoEmp = start;
     trozoFin = end;

     chunkSizeReal = end - start;

     fr.onload = procesaChunk;

     // blob.slice devuelve un blob
     fr.readAsDataURL(datosArchivo.file.slice(start, end));
  //   fr.readAsArrayBuffer(datosArchivo.file.slice(start, end));
  };

  var ultimo = false;


  var procesaChunk = function(blobSlice){

    var mensajeDatosChunk = {
      chunkFichero : true,
      data : null,
      metadataChunk : {
        numChunk : chunk,
        chukSize : chunkSizeReal,
        totalChunks : chunks,
        ultimaParteChunk : false,
        ultimoChunk : false
      }
    };

    if(chunk < chunks) {
      if(chunk == chunks-1){

        ultimo = true;

        console.log("Chunk",chunk,"Chunks", chunks);
        mensajeDatosChunk.data = blobSlice;

        chunk++;

        enviarChunk(mensajeDatosChunk);

      }else {
        console.log("chunk",chunk,"chunks", chunks);
        mensajeDatosChunk.num = chunk;

        chunk++;
        
        mensajeDatosChunk.data = blobSlice;
        enviarChunk(mensajeDatosChunk);      
      }
  
    }

  };


  var enviarChunk = function(event, remainingData) {
      var mensajeEnvio = {};

      var text;

      if(event) {
        mensajeEnvio = event;
        text = event.data.target.result;    
      }else {
        mensajeEnvio = remainingData;
        text = remainingData.data;        
      }

      if(text.length > CHUNK_LENGTH) {          
          mensajeEnvio.data = text.slice(0, CHUNK_LENGTH);
          GestorConexion.dataChannel.send(JSON.stringify(mensajeEnvio));      

      }      
      else {
        mensajeEnvio.data = text;
        mensajeEnvio.metadataChunk.ultimaParteChunk = true;
        mensajeEnvio.metadataChunk.ultimoChunk = ultimo;
        GestorConexion.dataChannel.send(JSON.stringify(mensajeEnvio));
      }
      
      mensajeEnvio.data = text.slice(mensajeEnvio.data.length);

      if(mensajeEnvio.data.length) {
        setTimeout(function(){
          enviarChunk(null, mensajeEnvio);
        },20);   
      }

  };


  loadNext(numChunk);

};




