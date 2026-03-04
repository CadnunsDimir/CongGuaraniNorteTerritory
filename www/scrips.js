var itemPorColuna = 14;

function carregarSelect() {
    var formSelect = document.getElementById("form_localide");

    fetch("/api/territorios")
        .then(response => response.json())
        .then(listaOption => {
            formSelect.innerHTML = "";
            listaOption.forEach(op => {
                var option = document.createElement("option");
                option.innerText = op.localidade;
                option.setAttribute("value", op.numeroCartao);
                formSelect.appendChild(option);
            });
            formSelect.value = document.getElementById("form_numero_territorio").value;
        })
        .catch(error => console.error("Erro ao buscar dados:", error));

    formSelect.addEventListener("change", ev => {
        var inputNumeroTerritorio = document.getElementById("form_numero_territorio");
        var cardNumber = ev.target.value;
        inputNumeroTerritorio.value = cardNumber;
        carregarEnderecos(cardNumber);
        atualizaUrl(cardNumber);
    });

    
}

async function carregarEnderecos(numeroCartao) {
    console.log("carregando cartão " + numeroCartao);
    var table = document.getElementById("tabela_enderecos");
    table.innerHTML = "";
    var cartao = await fetch("/api/territorios/" + numeroCartao)
        .then(res=> res.json());
    var duasColunas = cartao.enderecos.length > itemPorColuna;
    var marks = cartao.enderecos.map(e => [e.lat, e.long, e.endereco]);
    var color = cartao.corCartao;
    atualizarListaFullscreen(cartao.enderecos.map(x=>x.endereco));

    for (let i = 0; i < itemPorColuna; i++) {
        var endereco = cartao.enderecos[i];
        if (!endereco) break;
        var address = endereco.endereco;
        var tRow = document.createElement("tr");
        var tCell = document.createElement("td");
        tCell.innerText = address.replace('"', "");
        tRow.appendChild(tCell);

        if (duasColunas) {
            var tCell2 = document.createElement("td");
            tCell2.innerText = address.replace('"', "");
            tRow.appendChild(tCell2);

            var endereco2 = cartao.enderecos[itemPorColuna + i];
            if(endereco2)
                tCell2.innerText = endereco2.endereco.replace('"', "");
        }

        table.appendChild(tRow);
    }

    updateMarks(marks, color);
}

function inicializarTabela() {
    const params = new URLSearchParams(window.location.search);
    const cardNumber = params.get('cartao') || 1;
    document.getElementById("form_numero_territorio").value = cardNumber;
    document.getElementById("form_localide").value = cardNumber;
    carregarEnderecos(cardNumber);
}

function atualizaUrl(cardNumber) {
    const url = new URL(window.location.href);
    url.searchParams.set('cartao', String(cardNumber));
    window.history.replaceState({}, '', url.toString());
}
