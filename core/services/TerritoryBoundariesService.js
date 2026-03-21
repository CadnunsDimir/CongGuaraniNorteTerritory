import { parseStringPromise } from 'xml2js';
import Logger from '../Logger.js';

var boundaries = null;

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

    Logger.info(`Arquivo KML no formato de territo do HUB.JW.ORG Salvo! Poligono com ${boundaries.poligonCoordinates.length} pontos`);
}

var getPoligon = () => {
    return boundaries;
}

var TerritoryBoundariesService = {
    saveKmlAsPoligon,
    getPoligon
};

export default TerritoryBoundariesService;