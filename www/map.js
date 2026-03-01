var map = null;
var markerAtual = null;
var allMarks = [];
var markerOnClickEvent = function () {
    console.log("evento não definido!")
}

function inicializarMapa() {
    map = L.map('mapa').setView([-23.55, -46.63], 13); // São Paulo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var center = [-23.4866563, -46.5911963];

    L.marker(center).addTo(map)
        .bindPopup('Inicio')
        .openPopup();

    centralizarMapa(center);
}

function centralizarMapa(coordinates) {
    if (!map) return;
    map.setView(coordinates, 16);
}

function marker(coordinates, cor = '#FF0000', markerOnClickEvent) {
    if (!map) return;
    // circle with a small triangular tail pointing downwards
    const iconHtml = `
        <div style="position: relative; width: 20px; height: 20px;" class="mapMark">
            <div style="background-color: ${cor}; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white;"></div>
            <div style="position: absolute; left: 53%; bottom: -5px; width: 0; height: 0;
                        border-left: 6px solid transparent; border-right: 6px solid transparent;
                        border-top: 6px solid ${cor}; transform: translateX(-50%);"></div>
        </div>`;   
    

    const icon = L.divIcon({
        html: iconHtml,
        iconSize: [20, 26], // height includes tail
        className: ''
    });
    
    const m = L.marker(coordinates, { icon }).addTo(map);
    allMarks.push(m);
    [...document.getElementsByClassName("mapMark")].forEach(m=> 
        m.addEventListener("click", ()=> {
            if(markerOnClickEvent) {
                markerOnClickEvent();
            } else{
                console.warn("evento de click não definido!")
            }
        })
    )
    return m;
}

function updateMarks(marks, color) {
    allMarks.forEach(marker => map.removeLayer(marker));
    allMarks = [];
    var Alloordinates = []

    marks.forEach(m=> {
        var coordinates = m.map(m=> parseFloat(m));
        var newMark = marker(coordinates, color);
        allMarks.push(newMark);
        Alloordinates.push(coordinates);
    });
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

function mapaTelaCheia(){
    var mapDiv = document.getElementById("mapa");

    var style = mapDiv.style;
    style.position = "fixed";
    style.width = "100%";
    style.height = "100%";
    style.top = 0;
    style.left = 0;
    style.marginTop = 0;

    document.getElementById("fechar_mapa_botao").style.display = "block";
}