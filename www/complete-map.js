 var territoryCardsCache = JSON.parse(localStorage.getItem('territoryCardsCache') || "{}");
 var territoryMarksCache = {};

 function mountTerritoryListHtml() {
    var checkAll = document.getElementById("check-all");
    var territoryList = document.getElementById("territoryList");

    checkAll.checked = true;

    loadTerritoryList(data => {
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
                    if (!territoryCardsCache[territoryNumber].showOnStart) {
                        await addTerritoryToMap(territoryNumber);
                        paintListItem(li, territoryNumber);
                    }                    
                } else {
                    removeTerritoryFromMap(territoryNumber);
                    checkAll.checked = false;
                }
            });

            territoryList.appendChild(li);
            li.appendChild(label);
            label.appendChild(checkBox);
            label.appendChild(textNode);

            if (territoryCardsCache[item.numeroCartao] && territoryCardsCache[item.numeroCartao].showOnStart) {
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
}

function paintListItem(li, territoryNumber) {
    var color = territoryCardsCache[territoryNumber].corCartao;
    li.style.backgroundColor = color;
}

function updateLocalStorage() {
    localStorage.setItem('territoryCardsCache', JSON.stringify(territoryCardsCache));
}

async function addTerritoryToMap(territoryNumber){
    var territoryCard = territoryCardsCache[territoryNumber];

    if (!territoryCard) {
        territoryCard = await loadTerritoryCard(territoryNumber);
        territoryCardsCache[territoryNumber] = territoryCard;        
    }

     var marks = territoryCard.enderecos.map(e => [e.lat, e.long, e.endereco]);
    var color = territoryCard.corCartao;

    var groupMarks = addMarks(marks, color);
    territoryCard.showOnStart = true;
    territoryMarksCache[territoryNumber] = groupMarks;
    
    updateLocalStorage();
}

function removeTerritoryFromMap(territoryNumber) {
    var groupMarks = territoryMarksCache[territoryNumber];
    removeFeatureGroup(groupMarks);
    territoryMarksCache[territoryNumber] = null;
    territoryCardsCache[territoryNumber].showOnStart = false;
    updateLocalStorage();
}