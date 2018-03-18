var generaRandomHash = function(longitud) {
  var randomChars = "2345689ABCDEFGHJKMNPQRSTUVWXTZabcdefghkmnpqrstuvwxyz";
  var randomHash = '';
  for(var i = 0; i < longitud; i++) {
    var rnum = Math.floor(Math.random() * randomChars.length);
    randomHash += randomChars.substring(rnum, rnum + 1);
  }

  return randomHash;

};

var convierteBytes = function (tamanno) {
    var sizes = ['b', 'KB', 'MB', 'GB', 'TB'];
    
    var i = parseInt(Math.floor(Math.log(tamanno) / Math.log(1024)));
    return (tamanno / Math.pow(1024, i)).toFixed(2) + '' + sizes[i];
};

var actualizaBarraProgreso = function(actual, total) {
  var pc = parseInt(((actual+1) / total) * 100);
  var barraProgreso = document.getElementById("barraProgreso");
  var textoProgreso = document.getElementById("textoProgreso");
  barraProgreso.value = pc;
  textoProgreso.innerHTML = pc + "%";
};

var archivosDnD = {};

var AuxiliaDnD = {

  cargaFicheroDnD : function(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    // en versiones posteriores se podrán enviar varios ficheros al mismo tiempo, o en cola
    archivosDnD = evt.dataTransfer.files;

    gestionaContenidos.muestraArchivoCargado(archivosDnD[0]);
    var btnOfrecer = document.getElementById("btn_ofrecer");
    if(btnOfrecer == undefined) {
      gestionaContenidos.annadeBotonOfrecer();  
    }
  },

  seleccionadoInput : function() {
    var inputArchivo = document.getElementById("inputArchivo");

    var btnOfrecer = document.getElementById("btn_ofrecer");
    if(btnOfrecer == undefined) {
      gestionaContenidos.annadeBotonOfrecer();
    }

    gestionaContenidos.muestraArchivoCargado(inputArchivo.files[0]);
  },

  preventDragover : function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  },

  onClickDropZone : function() {
    var inputArchivo = document.getElementById("inputArchivo");
    inputArchivo.click();
  }


};


