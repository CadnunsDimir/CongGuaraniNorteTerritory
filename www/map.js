var map = null;
var markerAtual = null;
var telaCheiaBotao = null;
var fecharBotao = null;
var listaEnderecosTelaCheia = null;
var listaUl = null;
var allMarks = [];
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
}

function marker(coordinates, cor = '#FF0000') {
    if (!map) return;

    var iconHtml = `
        <div style="position: relative; width: 20px; height: 20px;" class="mapMark" data-description="marker_description">
            <div style="background-color: ${cor}; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white;"></div>
            <div style="position: absolute; left: 53%; bottom: -5px; width: 0; height: 0;
                        border-left: 6px solid transparent; border-right: 6px solid transparent;
                        border-top: 6px solid ${cor}; transform: translateX(-50%);"></div>
        </div>`;
    
    if (coordinates.length >= 3) {
        iconHtml = iconHtml.replace("marker_description", coordinates[2]);
    }

    const icon = L.divIcon({
        html: iconHtml,
        iconSize: [20, 26], // height includes tail
        className: ''
    });
    
    const newMarker = L.marker([
        parseFloat(coordinates[0]), 
        parseFloat(coordinates[1])
    ], { icon }).addTo(map);

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
        listItem.innerText = text;
        listaUl.appendChild(listItem);
    });
}

function toggleListaFullscreen() {
    if (listaUl.style.display == "block") {
        hide(listaUl)
    } else {
        show(listaUl);
    }
}