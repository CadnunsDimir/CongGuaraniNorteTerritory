
const TerritorioService = () => {
    const urlCsv = "XPTO?output=csv";
    const cardFieldkey = 1;
    const addressFieldKey = 2;
    const latKey = 4;
    const longKey = 3;
    const colorFieldKey = 0;

    var listaEnderecos = [];
    fetch(urlCsv)
        .then(response => response.text())
        .then(data => {
            listaEnderecos = parseCSV(data);
            console.log("[CSV] Todas as "+ listaEnderecos.length+" enderecos foram carregados!");
        })
        .catch(error => console.error("Erro ao buscar dados:", error));

    function parseCSV(csvString) {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let insideQuotes = false;

        for (let i = 0; i < csvString.length; i++) {
            const char = csvString[i];
            const nextChar = csvString[i + 1];

            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if ((char === '\n' || char === '\r') && !insideQuotes) {
                currentRow.push(currentField.trim());
                if (currentRow.length > 0 && currentRow[0] !== '') {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }

        if (currentField) currentRow.push(currentField.trim());
        if (currentRow.length > 0) rows.push(currentRow);

        return rows;
    }
    
    const getByCardNumber = (numeroCartao) => {
        console.log("Carregando cartão "+numeroCartao);
        var todosEnderecos = listaEnderecos.filter(endereco => endereco[cardFieldkey] === numeroCartao.toString());
        var corCartao = (todosEnderecos[0] || [])[colorFieldKey] || "#FFFFFF";
        return {
            numeroCartao,
            corCartao,
            enderecos: todosEnderecos.map(e=> ({
                endereco: e[addressFieldKey],
                lat: e[latKey],
                long: e[longKey]
            }))
        }
    }
    return {
        getByCardNumber
    }
};

export default TerritorioService();