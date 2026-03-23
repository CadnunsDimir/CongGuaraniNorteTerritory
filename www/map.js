mapHolder = (() => {
    var map = null;
    var markerAtual = null;
    var telaCheiaBotao = null;
    var fecharBotao = null;
    var listaUl = null;
    var allMarks = [];
    var centerMark = [];
    var fullScreenStateKey = "b03cd13b-b378-479d-8f7c-12ec6f2ff40a";
    var isGeolocated = false;
    var _showMarkOnClick = false;
    var selectedPositionMark = null;
    var _onClickMap = null;
    var _onClickMark = null;

    function triggerMapClick(coordinates) {
        showClickMark([ coordinates.lat, coordinates.long]);
        if (_onClickMap) {
            _onClickMap(coordinates);
        }
    }

    async function inicializarMapa() {
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

        var coordenadaText = document.createElement("p");
        coordenadaText.classList.add("coordinates")
        mapDiv.appendChild(coordenadaText);

        map.on('click', (e) => {
            var coordinates = {
                lat: parseFloat(e.latlng.lat.toFixed(7)),
                long: parseFloat(e.latlng.lng.toFixed(7))
            };
            console.log("Latitude: " + coordinates.lat + ", Longitude: " + coordinates.long);
            var text = coordinates.long + " \t" + coordinates.lat;
            coordenadaText.innerText = text;
            triggerMapClick(coordinates);
        });

        coordenadaText.addEventListener('click', ev => {
            var text = ev.target.innerText;
            htmlUtil.copyToClipboard(text);
        });

        await addTerritoryBoundaries();
    }

    function showClickMark(coordinates) {
        if (_showMarkOnClick) {
            if (selectedPositionMark) {
                map.removeLayer(selectedPositionMark);
            }

            selectedPositionMark = L.circleMarker(coordinates, {
                radius: 8,
                fillColor: "#24f020",
                color: "#FFFFFF",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map);
        }
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
            fillColor: !isError ? blue : red,
            color: "#FFFFFF",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);

        const accuracyCircle = L.circle(coordinates, {
            radius: 100, // em metros
            color: !isError ? blue : red,
            fillOpacity: 0.15,
            weight: 1
        }).addTo(map);

        centerMark.push(gpsMarker, accuracyCircle);
    }

    

    function marker(coordinates, cor = '#FF0000') {
        if (!map) return;
        const iconSize = 24;
        const iconAnchor = iconSize / 2;
        let lat, long, endereco;
        if (Array.isArray(coordinates)) {
            lat = coordinates[0];
            long = coordinates[1];
            endereco = coordinates[2] || "vazio";
        } else {
            lat = coordinates.lat;
            long = coordinates.long;
            endereco = coordinates.endereco || "vazio";
        }
        const icon = L.divIcon({
            className: 'marker-circulo', // A classe CSS que criamos
            html: `<div 
            class="mapMark"
            data-endereco="${endereco}"
            data-lat="${lat}"
            data-long="${long}"
            style="background-color: ${cor}; 
                           width: 100%; height: 100%; 
                           border-radius: 50%; 
                           display: flex; justify-content: center; align-items: center;">
                   <i class="fa-solid fa-house" style="color: white; font-size: ${iconAnchor}px"></i>
               </div>`, // O ícone da casinha
            iconSize: [iconSize, iconSize], // Tamanho do círculo [largura, altura]
            iconAnchor: [iconAnchor, iconAnchor] // Metade do tamanho para ficar centralizado na coordenada
        });

        const mapLink = htmlUtil.getDeviceType() === "desktop" ? 
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`:
            `geo:${lat},${long}`;

        const popUp = `
        <span style="font-weight: bold; margin-bottom: 10px; cursor: pointer"
        onclick="htmlUtil.copyToClipboard('${endereco}')">${endereco}</span>
        <div style="
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
            gap: 10px;
            align-items: flex-end;">
            <span style="font-size: 10px;color: grey;cursor: pointer"
            onclick="htmlUtil.copyToClipboard('${lat},${long}')">${lat},${long}</span>
            <a href='${mapLink}' target='_blank' class="routes-button">Rotas</a>
        </div> `;

        const newMarker = L.marker([
            parseFloat(lat),
            parseFloat(long)
        ], { icon })
            .bindPopup(popUp)
            .addTo(map);

        newMarker.data = coordinates;

        allMarks.push(newMarker);

        return newMarker;
    }

    function updateMarks(marks, color) {
        allMarks.forEach(marker => map.removeLayer(marker));
        allMarks = [];
        var Alloordinates = []

        marks.forEach(m => {
            var newMark = marker(m, color);
            allMarks.push(newMark);
            Alloordinates.push([parseFloat(m[0]), parseFloat(m[1])]);
        });

        [...document.getElementsByClassName("mapMark")].forEach(m =>
            m.addEventListener("click", event => {
                var data = event.currentTarget.dataset;
                if (_onClickMark && data) {
                    _onClickMark(data);
                } else {
                    console.warn("evento de 'onClickMark' não definido!")
                }
            })
        );

        var grupoMarcadores = L.featureGroup(allMarks).addTo(map);
        map.fitBounds(grupoMarcadores.getBounds(), {
            padding: [20, 20],
        });
        map.invalidateSize();


        if (!isGeolocated) {
            var center = getCenter(Alloordinates);
            addCenterMark(center, true);
        }
    }

    function addMarks(marks, color) {
        var allMarks = [];

        marks.forEach(m => {
            var newMark = marker(m, color);
            newMark.on('click', ()=> {
                if (_onClickMark) {
                    _onClickMark(m, newMark);
                }
            });
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
        var soma = allCoordinates.reduce((acc, current) => {
            return [acc[0] + current[0], acc[1] + current[1]]
        });

        return [
            soma[0] / total,
            soma[1] / total
        ];
    }

    function mapaTelaCheia() {
        mapDiv.classList.add("fullscreen");
        mapDiv.style.position = "";
        htmlUtil.show(fecharBotao);
        htmlUtil.show(listaEnderecosTelaCheia);
        htmlUtil.hide(telaCheiaBotao);
        localStorage.setItem(fullScreenStateKey, "true");

        map.invalidateSize();
    }

    function mapaNormal() {
        htmlUtil.hide(fecharBotao);
        htmlUtil.hide(listaEnderecosTelaCheia);
        htmlUtil.show(telaCheiaBotao);
        mapDiv.classList.remove("fullscreen");
        localStorage.removeItem(fullScreenStateKey);
        map.invalidateSize();
    }

    async function addTerritoryBoundaries() {
        var response = await fetch("/api/territory/boundaries");

        if (response.ok) {
            const data = await response.json();
            var coordinates = data.poligonCoordinates;

            L.polygon(coordinates, {
                color: 'blue',
                weight: 3,
                fill: false,
                opacity: 1
            }).addTo(map);
        }        
    }
    
    function showLocation(coordinates, zoom = 16) {
        var lat, long;
        if (Array.isArray(coordinates)) {
            lat = coordinates[0];
            long = coordinates[1]
        } else {
            lat = coordinates.lat;
            long = coordinates.long;
        }
        map.setView([lat, long], zoom);
    }

    var setShowMarkOnClick = (show) => {
        _showMarkOnClick = show;
        if (selectedPositionMark) {
            map.removeLayer(selectedPositionMark);
            selectedPositionMark = null;
        }
    };
    
    var setOnClickMap = (callback) => _onClickMap = callback;
    var setOnClickMark = (callback)=> _onClickMark = callback;

    return {
        inicializarMapa,
        updateMarks,
        mapaTelaCheia,
        mapaNormal,
        showLocation,
        addMarks,
        setShowMarkOnClick,
        removeFeatureGroup,
        setOnClickMap,
        setOnClickMark,
        triggerMapClick
    }
})();