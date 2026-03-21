import { parseStringPromise } from 'xml2js';
import Logger from '../Logger.js';
import Spreadsheet from '../Spreadsheet.js';

var boundaries = null;
var page = 'outros_locais';
var searchValueKey = 'limites_territorio';
var searchedValueColumn = 'A';
var valueColumn = 'D';

var saveKmlAsPoligon = async (kmlString) => {
    const xml = await parseStringPromise(kmlString);
    var boundariesNode = xml
        .kml
        .Document[0]
        .Placemark[0]
        .Polygon[0]
        .outerBoundaryIs[0]
        .LinearRing[0]
        .coordinates[0].split("\n").map(c => c.split(","));

    boundaries = {
        header: ['longitude', 'latitude', 'altitude'],
        poligonCoordinates: boundariesNode
    }

    await Spreadsheet.updateCell(page, searchValueKey,searchedValueColumn, JSON.stringify(boundaries), valueColumn);

    Logger.info(`Arquivo KML no formato de territo do HUB.JW.ORG Salvo! Poligono com ${boundaries.poligonCoordinates.length} pontos`);
}

var getPoligon = () => {
    return boundaries;
}

var preloadPoligonFromDB = async () => {
    var data = await Spreadsheet.getValueByReference(page, searchValueKey,searchedValueColumn, valueColumn);
    boundaries = data && data.length > 0 ? JSON.parse(data) : null;
    if (boundaries) {
        Logger.info("[Spreadsheet] [TerritoryBoundaries] Fronteiras do Territorios carregadas");
    } else {
        Logger.error("[Spreadsheet] [TerritoryBoundaries] Fronteiras do Territorios não encontrada na base de dados");
    }
}

var TerritoryBoundariesService = {
    saveKmlAsPoligon,
    preloadPoligonFromDB,
    getPoligon
};

TerritoryBoundariesService.preloadPoligonFromDB();

export default TerritoryBoundariesService;