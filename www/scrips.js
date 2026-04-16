var listaEnderecosTelaCheia = null;

alerts = {
    show: (type, message) => {
        var typeEnum = {
        success: "green",
        error: "red",
        warning: "yellow"
    };

    var color = typeEnum[type] || type.warning;
    var dialog = document.createElement("dialog");
    document.body.appendChild(dialog);
    dialog.innerText = message;

    var style = {
        border: `2px solid ${color}`,
        display: "block",
        top: "0",
        marginTop: "40px",
        boxShadow: "rgba(0, 0, 0, 0.2) 0px 1px 7px 0px, rgba(0, 0, 0, 0.19) 0px 3px 6px 0px;",
        borderRadius: "5px",
        fontSize: "9px"
    };

    for (const key in style) {
        dialog.style[key] = style[key];
    }

    setTimeout(() => {
        dialog.parentElement.removeChild(dialog);
    }, 5000);
    }
}

htmlUtil = {
    show: (htmlElement) => {
        if (htmlElement) {
            htmlElement.style.display =  "block";
        }
    },
    removeHide: (htmlElement) => {
        if (htmlElement) {
            htmlElement.style.display =  "";
        }
    },
    hide: (htmlElement) => {
        if (htmlElement) {
            htmlElement.style.display = "none";
        }
    },
    get: (selector) => document.querySelector(selector),
    getDeviceType: () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "mobile";
        }
        return "desktop";
    },
    copyToClipboard: (text)=> {
        navigator.clipboard.writeText(text).then(() => {
                alerts.show('success', "Texto copiado: " + text);
        }).catch(err => {
            alerts.show('error', 'Não foi possível copiar: ', err);
        });
    },

    isIOS: ()=> {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
            // Para iPads novos no iOS 13+ que se comportam como Desktop:
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }
}

function loadTerritoryList(onLoadOk) {
    fetch("/api/territorios")
        .then(response => response.json())
        .then(listaOption => {
            onLoadOk(listaOption)
        })
        .catch(error => console.error("Erro ao buscar dados:", error));
}

function carregarSelect() {
    var formSelect = document.getElementById("form_localide");

    loadTerritoryList(listaOption => {
        formSelect.innerHTML = "";
        listaOption.forEach(op => {
            var option = document.createElement("option");
            option.innerText = op.localidade;
            option.setAttribute("value", op.numeroCartao);
            formSelect.appendChild(option);
        });
        formSelect.value = document.getElementById("form_numero_territorio").value;
        // atualizarTituloFullscreen();
    })

    formSelect.addEventListener("change", ev => {
        var inputNumeroTerritorio = document.getElementById("form_numero_territorio");
        var cardNumber = ev.target.value;
        inputNumeroTerritorio.value = cardNumber;
        carregarEnderecos(cardNumber);
        atualizaUrl(cardNumber);
    });
}

async function loadTerritoryCard(territoryNumber) {
    var cartao = await fetch("/api/territorios/" + territoryNumber)
        .catch(error => console.error("Erro ao buscar dados:", error))
        .then(res => res.json());

    return cartao;
}

async function carregarEnderecos(numeroCartao) {
    console.log("carregando cartão " + numeroCartao);
    var table = document.getElementById("tabela_enderecos");
    table.innerHTML = "";
    var cartao = await loadTerritoryCard(numeroCartao);
    var marks = cartao.enderecos.map(e => [e.lat, e.long, e.endereco, numeroCartao]);
    var color = cartao.corCartao;
    atualizarListaFullscreen(cartao.enderecos);
    atualizarTituloFullscreen();
    var itemPorColuna = Math.round(cartao.enderecos.length / 2);

    for (let i = 0; i < itemPorColuna; i++) {
        var endereco = cartao.enderecos[i];
        if (!endereco) break;
        var address = endereco.endereco;
        var tRow = document.createElement("tr");
        var tCell = document.createElement("td");
        tCell.innerText = address.replace('"', "");
        tRow.appendChild(tCell);

        clickTableCell(tCell, endereco);

        var tCell2 = document.createElement("td");
        tRow.appendChild(tCell2);

        var endereco2 = cartao.enderecos[itemPorColuna + i];
        if (endereco2) {
            tCell2.innerText = endereco2.endereco.replace('"', "");
            clickTableCell(tCell2, endereco2);
        }

        table.appendChild(tRow);
    }

    mapHolder.updateMarks(marks, color);
}

function clickTableCell(tCell, endereco) {
    tCell.addEventListener("click", () => {
        var coordinates = [endereco.lat, endereco.long];
        mapHolder.showLocation(coordinates);
    });
}

function atualizarTituloFullscreen() {
    try {
        var nomeCartaoFullscreen = document.getElementById("nome-cartao-fullscreen");
        var select = document.getElementById("form_localide");
        const indice = select.selectedIndex || 0;
        const tituloCartao = select.options[indice].text;
        nomeCartaoFullscreen.innerText = tituloCartao;
    } catch (error) {
        alerts.show('error', error);   
    }    
}

function atualizarListaFullscreen(enderecos) {
    listaUl = listaEnderecosTelaCheia.getElementsByTagName("ul")[0];
    listaUl.innerHTML = "";
    enderecos.forEach(endereco => {
        var listItem = document.createElement("li");
        listItem.innerText = endereco.endereco;
        listaUl.appendChild(listItem);
        listItem.addEventListener("click", () => {
            var coordinates = [endereco.lat, endereco.long];
            mapHolder.showLocation(coordinates);
        });
    });
}

async function inicializarTabela() {
    const params = new URLSearchParams(window.location.search);
    const cardNumber = params.get('cartao') || 1;
    document.getElementById("form_numero_territorio").value = cardNumber;
    document.getElementById("form_localide").value = cardNumber;
    await carregarEnderecos(cardNumber);
}

function atualizaUrl(cardNumber) {
    const url = new URL(window.location.href);
    url.searchParams.set('cartao', String(cardNumber));
    window.history.replaceState({}, '', url.toString());
}

function toggleListaFullscreen() {
    var labelButton = document.getElementById("lista-enderecos-fullscreen-label-button");
    if (listaUl.style.display == "block") {
        labelButton.innerText = "mostrar";
        htmlUtil.hide(listaUl);
    } else {
        labelButton.innerText = "esconder";
        htmlUtil.show(listaUl);
    }
}
