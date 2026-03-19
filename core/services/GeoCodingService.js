import Logger from "../Logger.js";



var cache = {}

var getCoordinatesByAdress = async (street, hoseNumber, userAgent) => {
    var fullAddress = `${street}, ${hoseNumber}, São Paulo`;

    if (cache[fullAddress]) {
        Logger.info("[GEOCODING] Buscando do cache...");
        return cache[fullAddress];
    }

    var url = "https://nominatim.openstreetmap.org/search";

    const queryString = new URLSearchParams({
        q: fullAddress,
        format: 'jsonv2',
    }).toString();
    const fullUrl = `${url}?${queryString}`;
    Logger.info(`[GEOCODING] Buscando da web ${fullUrl}`);

    var response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
            'User-Agent': userAgent
        }
    });

   
    if (response.ok) {
         var data = await response.json();
         if (data.length > 0) {
            const { lat, lon, display_name } = data[0];

            cache[fullAddress] = {
                lat,
                long: lon,
                fullAddress: display_name
            };

            return cache[fullAddress];
         }
        
    }
    Logger.error(response.status, await response.text());
    throw new Error("Erro ao consultar serviço de GeoCoding");
}

const GeoCodingService = {
    getCoordinatesByAdress
}

export default GeoCodingService;