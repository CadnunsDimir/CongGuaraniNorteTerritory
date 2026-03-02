var map = null;
var markerAtual = null;
var telaCheiaBotao = null;
var fecharBotao = null;
var listaEnderecosTelaCheia = null;
var listaUl = null;
var allMarks = [];
var centerMark = [];
var fullScreenStateKey = "b03cd13b-b378-479d-8f7c-12ec6f2ff40a";

function inicializarMapa() {    
    mapDiv = document.getElementById("mapa");
    fecharBotao = document.getElementById("fechar_mapa_botao");
    telaCheiaBotao = document.getElementById("telacheia_mapa_botao");
    listaEnderecosTelaCheia = document.getElementsByClassName("lista-enderecos-fullscreen")[0]

    map = L.map('mapa').setView([-23.55, -46.63], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var center = [-23.4866563, -46.5911963];

    L.marker(center).addTo(map)
        .bindPopup('Inicio')
        .openPopup();

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            fecharBotao.style.display = "none";
            telaCheiaBotao.style.display = "block";
            localStorage.setItem(fullScreenStateKey, "false");
            map.invalidateSize();
        }
    });

    centralizarMapa(center);

    if (localStorage.getItem(fullScreenStateKey) === "true") {
        mapaTelaCheia();
    }
}

function centralizarMapa(coordinates) {
    if (!map) return;
    map.setView(coordinates, 16);
    map.invalidateSize();
    addCenterMark(coordinates);
}

function addCenterMark(coordinates) {
    
    centerMark.forEach(marker => map.removeLayer(marker));
    centerMark.length = 0;

    const gpsMarker = L.circleMarker(coordinates, {
        radius: 8,
        fillColor: "#2196F3",
        color: "#FFFFFF",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
    }).addTo(map);

    const accuracyCircle = L.circle(coordinates, {
        radius: 100, // em metros
        color: "#2196F3",
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
    ], { icon }).addTo(map);

    allMarks.push(newMarker);

    
    // const newMarker = L.marker([
    //     parseFloat(coordinates[0]), 
    //     parseFloat(coordinates[1])
    // ]).addTo(map);

    
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
                console.warn("evento de click não definido!")
            }
        })
    );

    var center = getCenter(Alloordinates);
    centralizarMapa(center);
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

function atualizarListaFullscreen(listaStrings) {
    listaUl = listaEnderecosTelaCheia.getElementsByTagName("ul")[0];
    listaUl.innerHTML = "";
    listaStrings.forEach(text=> {
        var listItem = document.createElement("li");
        var position = listaStrings.indexOf(text);
        listItem.innerText = text;
        listaUl.appendChild(listItem);
        listItem.addEventListener("click", ()=>{
            console.log("click no endereco "+position);
            var marker = allMarks[position];
            map.setView(marker.getLatLng(), 16);
        })
    });
}

function toggleListaFullscreen() {
    if (listaUl.style.display == "block") {
        hide(listaUl)
    } else {
        show(listaUl);
    }
}