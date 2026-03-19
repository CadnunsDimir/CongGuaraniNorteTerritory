 var territoryCardsCache = {};
 var territoryMarksCache = {};
 var selectedTerritories = JSON.parse(localStorage.getItem("selectedTerritories") || "[]");
 var territorios = [];

 function mountTerritoryListHtml() {
    var checkAll = document.getElementById("check-all");
    var territoryList = document.getElementById("territoryList");

    checkAll.checked = true;

    loadTerritoryList(data => {
        territorios = data;
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

function showForm() {
    var latInput = htmlUtil.get("#form_lat");
    var longInput = htmlUtil.get("#form_long");

    htmlUtil.hide(htmlUtil.get("#showFormButton"));
    htmlUtil.show(htmlUtil.get("#edit-dialog"));

    setTimeout(()=> {
        mapHolder.setShowMarkOnClick(true);

        mapHolder.setOnClickMap(coordinates => {
            latInput.value = coordinates.lat;
            longInput.value = coordinates.long;
        });
    });
    
}

function closeForm() {
    var form = htmlUtil.get("#edit-dialog-form");
    form.reset();
    htmlUtil.hide(htmlUtil.get("#edit-dialog"));
    htmlUtil.removeHide(htmlUtil.get("#showFormButton"));
    mapHolder.setShowMarkOnClick(false);
    mapHolder.setOnClickMap(null);
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

     var marks = territoryCard.enderecos.map(e => [e.lat, e.long, e.endereco]);
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
        const resposta = await fetch('/api/admin/territory/adresses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adresses)
        });

        const resultado = await resposta.json();

        if (resposta.ok && resultado.status === 201) {
            showAlert('success', 'Endereço adicionado com sucesso!');
            closeForm();
            if (selectedTerritories.includes(adresses.cartao)) {
                removeTerritoryFromMap(adresses.cartao);
                delete territoryCardsCache[adresses.cartao];
                await addTerritoryToMap(adresses.cartao);
            }
        } else {
            formulario.reset();
            showAlert('warning', resultado.message || 'Verifique os dados inseridos e tente novamente!');

        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        showAlert('error', 'Erro ao conectar com o servidor.');
    }
    submitBtn.disabled = false;
}