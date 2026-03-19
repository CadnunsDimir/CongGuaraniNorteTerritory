import Environment from "./Environment.js";

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

function toUrl(urlString, queryParams) {
    const url = new URL(urlString);
    const params = { ...queryParams };
    url.search = new URLSearchParams(params).toString();
    return url;
}

function fetchCsv(pageGid, callback) {
    const urlCsv = Utils.toUrl(Environment.dbCsvUrl, {
        gid: pageGid,
        output: 'csv'
    });

    fetch(urlCsv)
        .then(response => response.text())
        .then(data => {
            listaEnderecos = Utils.parseCSV(data);
            callback(listaEnderecos);
        })
        .catch(error => callback(null, error));
}

const Utils = {
    toUrl,
    fetchCsv,
    parseCSV
};

export default Utils;