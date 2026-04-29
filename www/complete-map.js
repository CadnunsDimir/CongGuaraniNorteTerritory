 var territoryCardsCache = {};
 var territoryMarksCache = {};
 var selectedTerritories = JSON.parse(localStorage.getItem("selectedTerritories") || "[]");
var territorios = [];
var isEditMode = false;
var enderecoAnterior = null;
var currentEditingMarker = null;
var addressSearchState = {
    input: null,
    suggestions: null,
    selectedGeocoding: null,
    lastGeocodingResults: [],
    requestId: 0,
    debouncedSearch: null,
    loadAllCardsPromise: null
};

 function mountTerritoryListHtml() {
    var checkAll = document.getElementById("check-all");
    var territoryList = document.getElementById("territoryList");

    checkAll.checked = true;

    loadTerritoryList(data => {
        territorios = data;
        if (addressSearchState.input) {
            addressSearchState.input.disabled = false;
            addressSearchState.input.placeholder = "Pesquisar endereço...";
        }
        territoryList.innerHTML = "";
        data.forEach(async item=> {
            var li = document.createElement("li");
            var label = document.createElement("label");
            var checkBox = document.createElement("input");
            var textNode = document.createTextNode(item.localidade);
            checkBox.setAttribute("type", "checkbox");
            checkBox.setAttribute("territory-number", item.numeroCartao);
            checkBox.addEventListener("change", async (ev)=> {
                var territoryNumber = ev.target.getAttribute("territory-number");
                var selected = ev.target.checked;
                console.log("Terr. "+ territoryNumber+" : "+selected);
                if (selected) {
                    if (!selectedTerritories.includes(territoryNumber)) {
                        await addTerritoryToMap(territoryNumber);
                        paintListItem(li, territoryNumber);
                    }
                } else {
                    removeTerritoryFromMap(territoryNumber);
                    removePaintListItem(li);
                    checkAll.checked = false;
                }
            });

            territoryList.appendChild(li);
            li.appendChild(label);
            label.appendChild(checkBox);
            label.appendChild(textNode);
            addOptionOnForm(item.numeroCartao, item.localidade);

            if (selectedTerritories.includes(item.numeroCartao.toString())) {
                checkBox.checked = true;
                await addTerritoryToMap(item.numeroCartao);
                paintListItem(li, item.numeroCartao);
            } else {
                checkAll.checked = false;
            }
        });
    });

    checkAll.addEventListener('change', (ev)=> {
        var shouldSelectAll = ev.target.checked;
        var checkboxes = territoryList.querySelectorAll("input[type=checkbox]");
        checkboxes.forEach(cb=> {
            cb.checked = shouldSelectAll;
            cb.dispatchEvent(new Event('change'));
        });
    });

    centralizarOnLoad();
}

function addOptionOnForm(territoryNumber, neighborhoood) {
    var option = document.createElement("option");
    option.value = territoryNumber;
    option.innerText = neighborhoood;
    htmlUtil.get("#form_numerocartao").appendChild(option);
}

function initAddressSearch() {
    var container = document.getElementById("address-search-overlay");
    var input = document.getElementById("address_search_input");
    var suggestions = document.getElementById("address_search_suggestions");

    if (!container || !input || !suggestions) return;

    addressSearchState.input = input;
    addressSearchState.suggestions = suggestions;
    addressSearchState.debouncedSearch = debounce(onAddressSearchInput, 400);
    input.disabled = territorios.length === 0;
    if (input.disabled) {
        input.placeholder = "Carregando territórios...";
    }

    input.addEventListener("input", ev => {
        addressSearchState.selectedGeocoding = null;
        addressSearchState.debouncedSearch(ev.target.value);
    });

    suggestions.addEventListener("click", ev => {
        ev.stopPropagation();
    });

    input.addEventListener("click", ev => {
        ev.stopPropagation();
    });

    document.addEventListener("click", ev => {
        var isInsideSearch = ev.target && typeof ev.target.closest === "function"
            ? ev.target.closest("#address-search-overlay")
            : null;
        if (!isInsideSearch) {
            clearAddressSuggestions();
        }
    });
}

function debounce(fn, wait) {
    var timeoutId = null;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), wait);
    };
}

function normalizeText(value) {
    return (value || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function getAllLoadedAddressesForSearch() {
    var uniqueAddress = new Map();
    Object.entries(territoryCardsCache).forEach(([territoryNumber, territoryCard]) => {
        (territoryCard?.enderecos || []).forEach(address => {
            var key = `${address.endereco}|${address.lat}|${address.long}|${territoryNumber}`;
            uniqueAddress.set(key, {
                endereco: address.endereco,
                lat: address.lat,
                long: address.long,
                cartao: territoryNumber
            });
        });
    });
    return [...uniqueAddress.values()];
}

function searchLocalAddresses(query, addresses, limit = 5) {
    var normalizedQuery = normalizeText(query);
    if (!normalizedQuery || normalizedQuery.length < 3) return [];

    return addresses
        .map(address => ({
            ...address,
            _normalizedAddress: normalizeText(address.endereco)
        }))
        .filter(address => address._normalizedAddress.includes(normalizedQuery))
        .sort((a, b) => {
            var indexA = a._normalizedAddress.indexOf(normalizedQuery);
            var indexB = b._normalizedAddress.indexOf(normalizedQuery);
            if (indexA !== indexB) return indexA - indexB;
            return a.endereco.length - b.endereco.length;
        })
        .slice(0, limit)
        .map(({ _normalizedAddress, ...address }) => address);
}

function renderSearchMessage(message) {
    var suggestions = addressSearchState.suggestions;
    if (!suggestions) return;
    suggestions.innerHTML = "";
    var row = document.createElement("div");
    row.className = "address-search-message";
    row.innerText = message;
    suggestions.appendChild(row);
    suggestions.classList.remove("hide");
}

function clearAddressSuggestions() {
    var suggestions = addressSearchState.suggestions;
    if (!suggestions) return;
    suggestions.innerHTML = "";
    suggestions.classList.add("hide");
}

function renderAddressSuggestions(localResults = [], geocodingResults = []) {
    var suggestions = addressSearchState.suggestions;
    if (!suggestions) return;

    suggestions.innerHTML = "";
    addressSearchState.lastGeocodingResults = geocodingResults;
    if (geocodingResults.length > 0 && !addressSearchState.selectedGeocoding) {
        addressSearchState.selectedGeocoding = geocodingResults[0];
    }

    if (localResults.length === 0 && geocodingResults.length === 0) {
        clearAddressSuggestions();
        return;
    }

    if (localResults.length > 0) {
        localResults.forEach(item => {
            var option = document.createElement("button");
            option.type = "button";
            option.className = "address-search-option";
            option.innerHTML = `<span>${item.endereco}</span><small>Cartão ${item.cartao}</small>`;
            option.addEventListener("click", () => selectLocalSearchResult(item));
            suggestions.appendChild(option);
        });
    }

    if (geocodingResults.length > 0) {
        var divider = document.createElement("div");
        divider.className = "address-search-divider";
        divider.innerText = "Resultado externo (geocoding)";
        suggestions.appendChild(divider);

        geocodingResults.forEach(item => {
            var option = document.createElement("button");
            var isActive = addressSearchState.selectedGeocoding
                && addressSearchState.selectedGeocoding.fullAddress === item.fullAddress;
            option.type = "button";
            option.className = "address-search-option geocoding" + (isActive ? " active" : "");
            option.innerHTML = `<span>${item.fullAddress}</span>`;
            option.addEventListener("click", () => selectGeocodingSuggestion(item));
            suggestions.appendChild(option);
        });

        var createBtn = document.createElement("button");
        createBtn.type = "button";
        createBtn.className = "address-search-create";
        createBtn.innerText = "+ Criar novo endereço";
        createBtn.disabled = !addressSearchState.selectedGeocoding;
        createBtn.addEventListener("click", () => openCreateAddressFromGeocoding(addressSearchState.selectedGeocoding));
        suggestions.appendChild(createBtn);
    }

    suggestions.classList.remove("hide");
}

function selectLocalSearchResult(result) {
    if (!addressSearchState.input) return;

    addressSearchState.input.value = result.endereco;
    mapHolder.showLocation([result.lat, result.long], 16);
    clearAddressSuggestions();
}

function selectGeocodingSuggestion(result) {
    addressSearchState.selectedGeocoding = result;
    if (addressSearchState.input) {
        var parsed = parseAddressNumber(result.fullAddress || "");
        addressSearchState.input.value = formatStreetAndNumber(parsed, result.fullAddress || "");
    }
    mapHolder.showLocation(result, 16);
    renderAddressSuggestions([], addressSearchState.lastGeocodingResults);
}

function openCreateAddressFromGeocoding(result) {
    if (!result) return;

    var parsed = parseAddressNumber(result.fullAddress || "");
    showForm();

    htmlUtil.get("#form_endereco").value = parsed.streetName || (result.fullAddress || "");
    htmlUtil.get("#form_numerocasa").value = parsed.houseNumber || "";
    htmlUtil.get("#form_lat").value = result.lat;
    htmlUtil.get("#form_long").value = result.long;

    mapHolder.triggerMapClick(result);
    mapHolder.showLocation(result, 16);
    clearAddressSuggestions();
}

function parseAddressNumber(address) {
    var value = (address || "").trim();
    if (!value) {
        return {
            streetName: "",
            houseNumber: ""
        };
    }

    var parts = value.split(",").map(x => x.trim()).filter(Boolean);
    var streetName = parts[0] || value;
    var houseNumber = "";
    var firstPart = parts[0] || "";
    var secondPart = parts[1] || "";

    // Nominatim often returns: "201, Rua X, Bairro, Cidade..."
    // In this format, first part is house number and second part is street.
    if (/^\d+[A-Za-z0-9\-\/]*$/.test(firstPart) && secondPart) {
        return {
            streetName: secondPart.trim(),
            houseNumber: firstPart.trim()
        };
    }

    var endNumberMatch = streetName.match(/^(.*)\s(\d+[A-Za-z0-9\-\/]*)$/);
    if (endNumberMatch) {
        streetName = endNumberMatch[1].trim();
        houseNumber = endNumberMatch[2].trim();
    }

    if (!houseNumber && parts[1]) {
        var startNumberMatch = parts[1].match(/^(\d+[A-Za-z0-9\-\/]*)/);
        if (startNumberMatch) {
            houseNumber = startNumberMatch[1];
        }
    }

    if (!houseNumber) {
        var queryEndNumberMatch = value.match(/^(.*?)[,\s]+(\d+[A-Za-z0-9\-\/]*)$/);
        if (queryEndNumberMatch) {
            streetName = queryEndNumberMatch[1].trim();
            houseNumber = queryEndNumberMatch[2].trim();
        }
    }

    return {
        streetName: streetName.trim(),
        houseNumber: houseNumber.trim()
    };
}

function formatStreetAndNumber(parsedAddress, fallback = "") {
    if (!parsedAddress) return fallback;
    var street = (parsedAddress.streetName || "").trim();
    var number = (parsedAddress.houseNumber || "").trim();
    if (street && number) return `${street}, ${number}`;
    if (street) return street;
    return fallback;
}

async function searchGeocoding(query) {
    var parsed = parseAddressNumber(query);
    if (!parsed.streetName) return [];

    try {
        var queryString = new URLSearchParams({
            streetName: parsed.streetName,
            houseNumber: parsed.houseNumber
        }).toString();
        var response = await fetch("/api/admin/territory/geocoding/v2?" + queryString);
        if (!response.ok) return [];

        var data = await response.json();
        return Array.isArray(data) ? data.slice(0, 5) : [];
    } catch (error) {
        console.error("Erro no geocoding da busca:", error);
        return [];
    }
}

async function ensureAllCardsLoadedForSearch() {
    if (!Array.isArray(territorios) || territorios.length === 0) return;

    if (addressSearchState.loadAllCardsPromise) {
        await addressSearchState.loadAllCardsPromise;
        return;
    }

    var missingCards = territorios
        .map(item => String(item.numeroCartao))
        .filter(territoryNumber => !territoryCardsCache[territoryNumber]);

    if (missingCards.length === 0) return;

    addressSearchState.loadAllCardsPromise = (async () => {
        for (const territoryNumber of missingCards) {
            try {
                var card = await loadTerritoryCard(territoryNumber);
                territoryCardsCache[territoryNumber] = card;
            } catch (error) {
                console.error("Erro ao carregar cartão para busca:", territoryNumber, error);
            }
        }
    })();

    try {
        await addressSearchState.loadAllCardsPromise;
    } finally {
        addressSearchState.loadAllCardsPromise = null;
    }
}

async function onAddressSearchInput(query) {
    var currentRequestId = ++addressSearchState.requestId;
    var trimmedQuery = (query || "").trim();

    if (trimmedQuery.length < 3) {
        clearAddressSuggestions();
        return;
    }

    renderSearchMessage("Buscando...");

    var localResults = searchLocalAddresses(trimmedQuery, getAllLoadedAddressesForSearch());

    if (localResults.length === 0) {
        await ensureAllCardsLoadedForSearch();
        if (currentRequestId !== addressSearchState.requestId) return;
        localResults = searchLocalAddresses(trimmedQuery, getAllLoadedAddressesForSearch());
    }

    if (localResults.length > 0) {
        renderAddressSuggestions(localResults, []);
        return;
    }

    var geocodingResults = await searchGeocoding(trimmedQuery);
    if (currentRequestId !== addressSearchState.requestId) return;

    if (geocodingResults.length === 0) {
        renderSearchMessage("Nenhum endereço encontrado.");
        return;
    }

    renderAddressSuggestions([], geocodingResults);
}

function showForm(addressData = null) {
    var latInput = htmlUtil.get("#form_lat");
    var longInput = htmlUtil.get("#form_long");

    htmlUtil.hide(htmlUtil.get("#showFormButton"));
    htmlUtil.show(htmlUtil.get("#edit-dialog"));

    if (addressData) {
        isEditMode = true;
        enderecoAnterior = addressData.endereco;
        htmlUtil.show(htmlUtil.get("#delete-button"));
        // Parse the address
        var parts = addressData.endereco.split(", ");
        var endereco = parts[0];
        var indexOfObsDivider = parts.length > 1 ? parts[1].indexOf("-") : -1;
        var numeroCasa = indexOfObsDivider > 0 ? parts[1].substring(0, indexOfObsDivider) : "";
        var obs = indexOfObsDivider > 0? parts[1].substring(indexOfObsDivider+1, parts[1].length) : "";

        if (numeroCasa.length == 0&& parts.length > 1 && parts[1]) {
            numeroCasa = parts[1].split(" ")[0];
            obs = parts[1].replace(numeroCasa, "").trim()
        }

        htmlUtil.get("#form_numerocartao").value = addressData.cartao;
        htmlUtil.get("#form_endereco").value = endereco;
        htmlUtil.get("#form_numerocasa").value = numeroCasa.trim();
        htmlUtil.get("#form_obs").value = obs.trim();
        latInput.value = addressData.lat;
        longInput.value = addressData.long;

        console.log(currentEditingMarker);
    } else {
        isEditMode = false;
        enderecoAnterior = null;
    }

    setTimeout(()=> {
        mapHolder.setShowMarkOnClick(!isEditMode);

        mapHolder.setOnClickMap(coordinates => {
            latInput.value = coordinates.lat;
            longInput.value = coordinates.long;
            if (isEditMode && currentEditingMarker) {
                currentEditingMarker.setLatLng([coordinates.lat, coordinates.long]);
            }
        });
    });
    
}

async function onFormInputChange() {
    const queryString = new URLSearchParams({
        streetName: htmlUtil.get("#form_endereco").value,
        houseNumber: htmlUtil.get("#form_numerocasa").value
    }).toString();

    await geocodingV2(queryString);
}

async function geocodingV2(queryString) {
     var response = await fetch("/api/admin/territory/geocoding/v2?" + queryString);

    if (response.ok) {
        const data = await response.json();
        console.log("geocodingV2", data);
        if (data.length === 1) {
            mapHolder.triggerMapClick(data[0]);
            mapHolder.showLocation(data[0], 15);
        } else {
            const selected = await showGeocodingOptionsModal(data);
            if (selected) {
                mapHolder.triggerMapClick(selected);
                mapHolder.showLocation(selected, 15);
            }
        }
    }
}

function setStyle(el, style) {
    Object.entries(style)
                .forEach(([key, value])=> el.style[key] = value);
}

function createEl(type, style) {
    var newElement = document.createElement(type);
    setStyle(newElement, style);
    if (style.innerText) {
        newElement.innerText = style.innerText
    }
    return newElement;
}

function showGeocodingOptionsModal(options) {
    return new Promise((resolve) => {
        if (!Array.isArray(options) || options.length === 0) return resolve(null);
        var dialog = createEl("dialog", {
            maxWidth: "520px",
            width:  "calc(100% - 30px)"
        });

        var title = createEl("p", {
            innerText: "Selecione um endereço",
            fontWeight: "bold",
            marginBottom: "8px",
        });

        var lista = createEl("ul", {
            width: "100%",
            marginBottom: '10px',
            padding: '0',
            display: 'flex',
            gap: '10px',
            flexDirection: 'column'
        });

        options.forEach((opt, index) => {
            var li = document.createElement("li");
            li.innerText = opt.fullAddress;
            lista.appendChild(li);

            setStyle(li, {
                listStyle: "none",
                fontSize: "10px",
                width: "100%",
                padding: "10px",
                border: "1px solid grey",
                borderRadius: "7px",
                boxSizing: "border-box"
            });

            li.addEventListener("click", ()=> {
                resolve(opt);
                cleanup();
            });
        });

        var buttons = document.createElement("div");
        buttons.style.display = "flex";
        buttons.style.justifyContent = "flex-end";
        buttons.style.gap = "8px";

        var cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.innerText = "Cancelar";

        cancelBtn.addEventListener("click", () => dialog.close("cancel"));

        buttons.appendChild(cancelBtn);

        dialog.appendChild(title);
        dialog.appendChild(lista);
        dialog.appendChild(buttons);
        document.body.appendChild(dialog);

        var cleanup = () => {
            if (dialog && dialog.parentElement) dialog.parentElement.removeChild(dialog);
        };

        dialog.addEventListener("close", () => {
            try {
                resolve(null);
            } finally {
                cleanup();
            }
        }, { once: true });

        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        } else {
            htmlUtil.show(dialog);
        }

        // Preview first option immediately
        mapHolder.showLocation(options[0], 15);
    });
}

function closeForm() {
    var form = htmlUtil.get("#edit-dialog-form");
    form.reset();
    htmlUtil.hide(htmlUtil.get("#edit-dialog"));
    htmlUtil.removeHide(htmlUtil.get("#showFormButton"));
    mapHolder.setShowMarkOnClick(false);
    mapHolder.setOnClickMap(null);
    htmlUtil.hide(htmlUtil.get("#delete-button"));
    isEditMode = false;
    enderecoAnterior = null;
    currentEditingMarker = null;
}

function centralizarOnLoad() {
    var center = [-23.4866563, -46.5911963];
    mapHolder.showLocation(center, 15);
}

function paintListItem(li, territoryNumber) {
    var color = territoryCardsCache[territoryNumber].corCartao;
    li.style.backgroundColor = color;
}

function removePaintListItem(li){
    li.style.backgroundColor = "";
}

function updateLocalStorage() {
    localStorage.setItem('selectedTerritories', JSON.stringify(selectedTerritories));
}

async function addTerritoryToMap(territoryNumber){
    var territoryCard = territoryCardsCache[territoryNumber];

    if (!territoryCard) {
        territoryCard = await loadTerritoryCard(territoryNumber);
        territoryCardsCache[territoryNumber] = territoryCard;        
    }

     var marks = territoryCard.enderecos.map(e => ({lat: e.lat, long: e.long, endereco: e.endereco, cartao: territoryNumber}));
    var color = territoryCard.corCartao;

    var groupMarks = mapHolder.addMarks(marks, color);
    territoryCard.showOnStart = true;
    territoryMarksCache[territoryNumber] = groupMarks;
    if(!selectedTerritories.includes(territoryNumber))
        selectedTerritories.push(territoryNumber);
    updateLocalStorage();
}

function removeTerritoryFromMap(territoryNumber) {
    var groupMarks = territoryMarksCache[territoryNumber];
    mapHolder.removeFeatureGroup(groupMarks);
    territoryMarksCache[territoryNumber] = null;
    territoryCardsCache[territoryNumber].showOnStart = false;
    selectedTerritories = selectedTerritories.filter(x=> x !== territoryNumber);
    console.log(selectedTerritories);
    updateLocalStorage();
}

function showList() {
    var lista = document.getElementById("lista-oculta");
    lista.style.display = lista.style.display == 'block' ? 'none' : 'block';
}

async function submitForm(event) {
    event.preventDefault();
    var submitBtn = htmlUtil.get("#edit-dialog-form button");
    submitBtn.disabled = true;
    const formulario = htmlUtil.get('#edit-dialog-form');
    const formData = new FormData(formulario);
    const newAddress = Object.fromEntries(formData.entries());
    const cor = territorios.filter(x=> x.numeroCartao === newAddress.cartao)[0].cor;

    console.log(newAddress);

    var obs = newAddress.obs ? " - "+newAddress.obs : "";

    const adresses = {
        ...newAddress,
        cor,
        endereco: newAddress.endereco +", "+newAddress.numeroCasa + obs
    };

    try {
        let url = '/api/admin/territory/adresses';
        let method = 'POST';
        if (isEditMode) {
            url += '/' + encodeURIComponent(enderecoAnterior);
            method = 'PUT';
        }

        const resposta = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adresses)
        });

        const resultado = await resposta.json();

        if (resposta.ok && (resultado.status === 201 || resultado.status === 200)) {
            const message = isEditMode ? 'Endereço editado com sucesso!' : 'Endereço adicionado com sucesso!';
            alerts.show('success', message);
            closeForm();
            if (selectedTerritories.includes(adresses.cartao)) {
                removeTerritoryFromMap(adresses.cartao);
                delete territoryCardsCache[adresses.cartao];
                await addTerritoryToMap(adresses.cartao);
            }
        } else {
            formulario.reset();
            alerts.show('warning', resultado.message || 'Verifique os dados inseridos e tente novamente!');

        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alerts.show('error', 'Erro ao conectar com o servidor.');
    }
    submitBtn.disabled = false;
}

async function deleteAddress() {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;

    try {
        const resposta = await fetch('/api/admin/territory/adresses/' + encodeURIComponent(enderecoAnterior), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const resultado = await resposta.json();

        if (resposta.ok && resultado.status === 200) {
            alerts.show('success', 'Endereço excluído com sucesso!');

            var cartao = currentEditingMarker.data.cartao;
             if (selectedTerritories.includes(cartao)) {
                removeTerritoryFromMap(cartao);
                delete territoryCardsCache[cartao];
                await addTerritoryToMap(cartao);
            }

            closeForm();
            
        } else {
            alerts.show('warning', resultado.message || 'Erro ao excluir endereço!');
        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alerts.show('error', 'Erro ao conectar com o servidor.');
    }
}
