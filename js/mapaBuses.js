function ajax(URL, successCallback, errorCallback){
    $.ajax({
        url: URL,
        type: "GET",
        dataType: "text",
        scriptCharset: "utf-8",
        success: successCallback,
        error: errorCallback
    }); // $.ajax
  } // function ajax

L.NumberedDivIcon = L.Icon.extend({
    options: {
        iconUrl: 'leaflet/images/marker-verde.png',
        number: '',
        shadowUrl: null,
        iconSize: new L.Point(25, 43),
        iconAnchor: new L.Point(13, 43),
        popupAnchor: new L.Point(0, -33),
        className: 'leaflet-div-icon'
    },

    createIcon: function() {
        var div = document.createElement('div');
        var img = this._createImg(this.options['iconUrl']);
        var numdiv = document.createElement('div');
        numdiv.setAttribute("class", "number");
        numdiv.innerHTML = this.options['number'] || '';
        div.appendChild(img);
        div.appendChild(numdiv);
        this._setIconStyles(div, 'icon');
        return div;
    },
    createShadow: function() {
        return null;
    }
});



let empresas = [
    {
        codigo: '10',
        descripcion: 'C.O.E.T.C.'
    },
    {
        codigo: '13',
        descripcion: 'EMPRESA CASANOVA LIMITADA'
    },
    {
        codigo: '18',
        descripcion: 'C.O.P.S.A.'
    },
    {
        codigo: '20',
        descripcion: 'C.O.M.E.S.A'
    },
    {
        codigo: '29',
        descripcion: 'C.I.T.A.'
    },
    {
        codigo: '32',
        descripcion: 'SAN ANTONIO TRANSPORTE Y TURISMO (SATT)'
    },
    {
        codigo: '33',
        descripcion: 'C.O. DEL ESTE'
    },
    {
        codigo: '35',
        descripcion: 'TALA-PANDO-MONTEVIDEO'
    },
    {
        codigo: '36',
        descripcion: 'SOLFY SA'
    },
    {
        codigo: '37',
        descripcion: 'TURIL SA'
    },
    {
        codigo: '39',
        descripcion: 'ZEBALLOS HERMANOS'
    },
    {
        codigo: '41',
        descripcion: 'RUTAS DEL NORTE'
    },
    {
        codigo: '50',
        descripcion: 'C.U.T.C.S.A.'
    },
    {
        codigo: '60',
        descripcion: 'RA.IN.COOP.'
    },
    {
        codigo: '70',
        descripcion: 'U.C.O.T.'
    },
    {
        codigo: '80',
        descripcion: 'COIT'
    }

];

var mapEmpresas = new Map();

for (let i in empresas) {
	mapEmpresas.set(  parseInt(empresas[i].codigo), empresas[i].descripcion);	
}



//mapEmpresas.set(50, 'Cutcsa');
//mapEmpresas.set(70, 'Ucot');
//mapEmpresas.set(10, 'Coetc');

var map = L.map('map');
var cartoBasica = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://opentopomap.org/about">OpenTopoMap</a>',
  maxZoom: 19,
  detectRetina: true,
//   tileSize: 512,
//   zoomOffset: -1,
});
cartoBasica.addTo(map);

map.setView([-34.8901,-56.1679], 13);

// var cartoBasica = L.tileLayer.wms(
//     'http://geoserver.montevideo.gub.uy/geoserver/gwc/service/wms?', {
//         maxZoom: 18,
//         layers: 'stm_carto_basica',
//         format: 'image/png',
//         transparent: true,
//         version: '1.3.0',
//         tiled: true,
//         srs: 'EPSG:3857',
//         attribution: "Intendencia de Montevideo"
//     });

// var map = L.map('map', {
//     layers: [cartoBasica]
// }).setView([-34.828, -56.180], 12);
// //.setView([-34.903, -56.188], 14);

var refresh = parseInt(document.getElementById("refresh").value);
/*
var latVerde = parseInt(document.getElementById("latVerde").value);
var latAmarillo = parseInt(document.getElementById("latAmarillo").value);
var antiguo = parseInt(document.getElementById("antiguo").value);
*/

var processFeature = function(feature, latlng) {
    var idBus = feature.properties.linea;
    var empresa = feature.properties.codigoEmpresa;
    var image;

    if (empresa == 10) {
        image = "marker-rojo.png";
    } else if (empresa == 20) {
        image = "marker-verde.png";
    } else if (empresa == 50) {
        image = "marker_hole.png";
    } else if (empresa == 70) {
        image = "marker-amarillo.png";
    } else {
    	image = "marker-gris.png";
    }

    var label = '<b>Linea: ' + idBus + '</b><br>' +
    	'<b>Subsistema:</b> ' + feature.properties.subsistemaDesc + '<br>' +
    	'<b>Empresa:</b> ' + mapEmpresas.get(feature.properties.codigoEmpresa)  + '<br>' + 
    	'<b>Destino:</b> ' + feature.properties.destinoDesc  + '<br>' +
    	'<b>Sublinea:</b> ' + feature.properties.sublinea  + '<br>';

    		
    return new L.Marker(latlng, {
            icon: new L.NumberedDivIcon({ number: idBus, iconUrl: 'leaflet/images/' + image })
        })
        .bindPopup(label);
};



var xhttp = new XMLHttpRequest();
var parameters = {};
parameters.subsistema = document.getElementById("subsistema").value;
parameters.empresa = document.getElementById("empresas").value;
document.getElementById("lblEmpresa").innerHTML = 'Visualizando datos de empresa <B>' + document.getElementById("empresas")[0].text + '</B>';
var realtime, realtimeAtras;

var lblCantBuses = document.getElementById("lblCantBuses");

function centerLeafletMapOnPoint(map, long, lat) {
	  var latlng = [ lat, long ];
	  
	  map.panTo(latlng);
	}


// var service = function(success, error) {
//     L.Realtime.reqwest({
//             url: 'http://www.montevideo.gub.uy/buses/rest/stm-online', //'rest/stm-online'
//             method: 'POST',
//             type: 'json',
//             contentType: 'application/json',
//             data: JSON.stringify(parameters)
//         })
//         .then(function(data) {
//             realtime.clearLayers();
//             lblCantBuses.innerHTML = " (" + data.features.length + " posiciones reportadas...)";
            
//             // Si hay uno centro el mapa
//             if (data.features.length == 1) {
//             	centerLeafletMapOnPoint( map, data.features[0].geometry.coordinates[0] , data.features[0].geometry.coordinates[1]);
//             }
            
//             success(data);
//         })
//         .fail(error);
// };

var service = function(success, error) {
    $.ajax({
    url: 'funciones.php',
    data: JSON.stringify(parameters),
    method: 'POST',
    contentType: 'application/json',
    type: 'json',
    success: function(data) {
      console.log(return_value);
      data = JSON.parse(return_value);

      $("#instrucciones").hide();
      $("#productos_tabs").show();
      $("#pdf_button").show();
      document.getElementById("pdf_button").classList.remove("disabled");

      if (data.GHI != null){
        document.getElementById('td_ghi').innerHTML = data.GHI[0].toFixed(2) + " kWh/m² día";
        document.getElementById('td_gti').innerHTML = data.GTI[0].toFixed(2) + " kWh/m² día";
        document.getElementById('td_dni').innerHTML = data.DNI[0].toFixed(2) + " kWh/m² día";
        var num_lat = parseFloat(query_lat).toFixed(3);
        var num_lon = parseFloat(query_lon).toFixed(3);
        pdf_lat = num_lat;
        pdf_lon = num_lon;
        dibujarGHI(data.GHI, num_lat, num_lon, "grafica_ghi");
        dibujarGTI(data.GTI, num_lat, num_lon, "grafica_gti");
        dibujarDNI(data.DNI, num_lat, num_lon, "grafica_dni");
      } else{
        $("#png_grafica_ghi img").remove();                    // saco todas las imagenes
        $("#png_grafica_gti img").remove();                    // saco todas las imagenes
        $("#png_grafica_dni img").remove();                    // saco todas las imagenes
      }

    },
    error: function (e) {
        console.log('bilineal Bummer: there was an error!');
        console.log(e);
    }
  });
};

realtime = L.realtime(service, {
    interval: refresh * 1000,
    pointToLayer: processFeature,
    updateFeature: function(feature, oldLayer, newLayer) {
            processFeature(feature, newLayer._latlng);
        }
        /*
        ,getFeatureId: function(featureData){
            return featureData.properties.codigoBus + featureData.properties.variante;
        }
        */
}).addTo(map);






var busStop = L.tileLayer.wms('http://geoserver.montevideo.gub.uy/geoserver/gwc/service/wms', {
    maxZoom: 18,
    attribution: "Intendencia de Montevideo",
    format: 'image/png',
    transparent: true,
    layers: 'uptu_ubic_parada',
    version: '1.3.0',
    srs: 'EPSG:3857',
    tiled: true
});


document.getElementById("empresas").addEventListener("change", function(e) {
    parameters.empresa = e.target.value;
    if (parameters.empresa < 0) {
        $('#lblEmpresa')[0].innerHTML = 'Sin filtro por empresa';
    } else {
        $('#lblEmpresa')[0].innerHTML = 'Visualizando datos de empresa <B>' + e.target[e.target.selectedIndex].text + '</B>';
    }

    lblCantBuses.innerHTML = "";
});


document.getElementById("subsistema").addEventListener("change", function(e) {
    parameters.subsistema = e.target.value;
//    if (parameters.subsistema < 0) {
//        $('#lblSubsistema')[0].innerHTML = 'Sin filtro por empresa';
//    } else {
//        $('#lblSubsistema')[0].innerHTML = 'Visualizando datos de subsistema <B>' + e.target[e.target.selectedIndex].text + '</B>';
//    }

    lblCantBuses.innerHTML = "";
});


document.getElementById("linea").addEventListener("change", function(e) {

	if (e.target.value && 0 < e.target.value.length ) {
	    parameters.lineas = [];

		if (e.target.value.indexOf(',') != -1) {
	        var result = e.target.value.split(',');
	        for (var i = 0; i < result.length; i++) {
	            parameters.lineas.push(result[i]);
	        }
	    } else {
        	parameters.lineas.push(e.target.value);
	    }
    } else {
    	if ('lineas' in parameters) {
    		delete parameters.lineas;	
    	}
    }
});

document.getElementById("variante").addEventListener("change", function(e) {

	if (e.target.value && 0 < e.target.value.length ) {

		parameters.variante = [];

		if (e.target.value.indexOf(',') != -1) {
			var result = e.target.value.split(',');
			for (var i = 0; i < result.length; i++) {
				parameters.variante.push(parseInt(result[i], 10));
			}
		} else {
			if (parseInt(e.target.value)) {
				parameters.variante.push(parseInt(e.target.value, 10));
			}
		}
	} else {
    	if ('variante' in parameters) {
    		delete parameters.variante;	
    	}
	}

});

document.getElementById("bus").addEventListener("change", function(e) {
	parameters.bus = null;
	
	if (parseInt(e.target.value)) {
        parameters.bus = parseInt(e.target.value);
    } else {
        document.getElementById("bus").value = "";
    }
});




document.getElementById("refresh").addEventListener("change", function(e) {
    realtime.options.interval = parseInt(e.target.value) * 1000;
    realtime.stop();
    realtime.start();
});

/*
document.getElementById("latVerde").addEventListener("change", function(e){
	latVerde = parseInt(e.target.value);
});
document.getElementById("latAmarillo").addEventListener("change", function(e){
	latAmarillo = parseInt(e.target.value);
});
document.getElementById("antiguo").addEventListener("change", function(e){
	antiguo = parseInt(e.target.value);
});
*/
$('#butCollapse').click(function() {
    $(this).text(function(i, old) {
        return old == '+' ? '-' : '+';
    });
});






