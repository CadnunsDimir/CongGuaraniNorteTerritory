var map = null;
var markerAtual = null;
var telaCheiaBotao = null;
var fecharBotao = null;
var listaUl = null;
var allMarks = [];
var centerMark = [];
var fullScreenStateKey = "b03cd13b-b378-479d-8f7c-12ec6f2ff40a";
var isGeolocated = false;

function inicializarMapa() {    
    mapDiv = document.getElementById("mapa");
    fecharBotao = document.getElementById("fechar_mapa_botao");
    telaCheiaBotao = document.getElementById("telacheia_mapa_botao");
    listaEnderecosTelaCheia = document.getElementsByClassName("lista-enderecos-fullscreen")[0];    

    map = L.map('mapa').setView([-23.55, -46.63], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var center = [-23.4866563, -46.5911963];

    L.marker(center).addTo(map)
        .bindPopup('Salão do Reino')
        .openPopup();

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fecharBotao.style.display = "none";
            telaCheiaBotao.style.display = "block";
            localStorage.setItem(fullScreenStateKey, "false");
            map.invalidateSize();
        }
    });

    exibirGeoLocalizacao();

    if (localStorage.getItem(fullScreenStateKey) === "true") {
        mapaTelaCheia();
    }

    var coordenadaText = document.getElementById("coordenadas");
    map.on('click', (e) => {
        console.log("Latitude: " + e.latlng.lat + ", Longitude: " + e.latlng.lng);
        var text = e.latlng.lng+"\t"+e.latlng.lat;
        coordenadaText.innerText = text;      
    });

    coordenadaText.addEventListener('click', ev => {
        var text = ev.target.innerText;
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard: " + text);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    })
}

function exibirGeoLocalizacao() {
    if ("geolocation" in navigator) {   
        isGeolocated = true;
        const watchID = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            addCenterMark([latitude, longitude]);
            isGeolocated = true;
        });
        // Para parar de monitorar depois:
        // navigator.geolocation.clearWatch(watchID);
    } else {
        isGeolocated = false;
    }
}

function addCenterMark(coordinates, isError = false) {
    centerMark.forEach(marker => map.removeLayer(marker));
    centerMark.length = 0;
    var blue = "#2196F3";
    var red = "rgb(223, 41, 0)"

    const gpsMarker = L.circleMarker(coordinates, {
        radius: 8,
        fillColor: !isError ?  blue : red,
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map);

    const accuracyCircle = L.circle(coordinates, {
        radius: 100, // em metros
        color: !isError ?  blue : red,
        fillOpacity: 0.15,
        weight: 1
    }).addTo(map);

    centerMark.push(gpsMarker, accuracyCircle);
}

function marker(coordinates, cor = '#FF0000') {
    if (!map) return;
    const iconSize = 24;
    const iconAnchor = iconSize / 2;
    const icon = L.divIcon({
        className: 'marker-circulo', // A classe CSS que criamos
        html: `<div 
            class="mapMark"
            data-description="${coordinates[2] || "vazio"}" 
            style="background-color: ${cor}; 
                           width: 100%; height: 100%; 
                           border-radius: 50%; 
                           display: flex; justify-content: center; align-items: center;">
                   <i class="fa-solid fa-house" style="color: white; font-size: ${iconAnchor}px"></i>
               </div>`, // O ícone da casinha
        iconSize: [iconSize, iconSize], // Tamanho do círculo [largura, altura]
        iconAnchor: [iconAnchor, iconAnchor] // Metade do tamanho para ficar centralizado na coordenada
    });

    const newMarker = L.marker([
        parseFloat(coordinates[0]), 
        parseFloat(coordinates[1])
    ], { icon })
    .bindPopup(coordinates[2] || '')
    .addTo(map);

    allMarks.push(newMarker);

    return newMarker;
}

function updateMarks(marks, color, onClickMark) {
    allMarks.forEach(marker => map.removeLayer(marker));
    allMarks = [];
    var Alloordinates = []

    marks.forEach(m=> {
        var newMark = marker(m, color);
        allMarks.push(newMark);
        Alloordinates.push([parseFloat(m[0]), parseFloat(m[1])]);
    });

    [...document.getElementsByClassName("mapMark")].forEach(m=> 
        m.addEventListener("click", event=> {
            var description = event.currentTarget.dataset.description;
            if(onClickMark && description) {
                onClickMark(description);
            } else{
                console.warn("evento de 'onClickMark' não definido!")
            }
        })
    );

    var grupoMarcadores = L.featureGroup(allMarks).addTo(map);
    map.fitBounds(grupoMarcadores.getBounds(), {
        padding: [20, 20],
    });
    map.invalidateSize();

      
    if(!isGeolocated){
        var center = getCenter(Alloordinates);  
        addCenterMark(center, true);
    }
}

function addMarks(marks, color) {
    var allMarks = [];

    marks.forEach(m=> {
        var newMark = marker(m, color);
        allMarks.push(newMark);
    });

    var grupoMarcadores = L.featureGroup(allMarks).addTo(map);

    return grupoMarcadores;
}

function removeFeatureGroup(featureGroup) {
    map.removeLayer(featureGroup);
}

function getCenter(allCoordinates) {
    var total = allCoordinates.length;
    var soma = allCoordinates.reduce((acc,current)=> {
        return [acc[0] + current[0], acc[1] + current[1]]
    });
    
    return [
        soma[0]/total,
        soma[1]/total
    ];
}

function show(htmlElement) {
    htmlElement.style.display = "block";
}

function hide(htmlElement) {
    htmlElement.style.display = "none";
}

function mapaTelaCheia(){
    mapDiv.classList.add("fullscreen");
    mapDiv.style.position = "";
    show(fecharBotao);
    show(listaEnderecosTelaCheia);
    hide(telaCheiaBotao);
    localStorage.setItem(fullScreenStateKey, "true");

    map.invalidateSize();
}

function mapaNormal() {
    hide(fecharBotao);
    hide(listaEnderecosTelaCheia);
    show(telaCheiaBotao);
    mapDiv.classList.remove("fullscreen");
     localStorage.removeItem(fullScreenStateKey);
    map.invalidateSize();
}

function toggleListaFullscreen() {
    var labelButton = document.getElementById("lista-enderecos-fullscreen-label-button");
    if (listaUl.style.display == "block") {
        labelButton.innerText = "mostrar";
        hide(listaUl);
    } else {
        labelButton.innerText = "esconder";
        show(listaUl);
    }
}