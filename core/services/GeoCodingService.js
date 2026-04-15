import Logger from "../Logger.js";

var cache = {}
var cacheV2 = {}

var getCoordinatesByAdress = async (street, hoseNumber, userAgent) => {
    var data = await getCoordinatesByAdressV2(street, hoseNumber, userAgent);
    var queryFullAddress = `${street}, ${hoseNumber}, São Paulo`;
   
    if (data.length > 0) {
        const { lat, long, fullAddress } = data[0];

        cache[queryFullAddress] = {
            lat,
            long,
            fullAddress
        };

        return cache[queryFullAddress];
    }

    throw new Error("Erro ao consultar serviço de GeoCoding");
}

var getCoordinatesByAdressV2 = async (street, hoseNumber, userAgent) => {
    var fullAddress = `${street}, ${hoseNumber}, São Paulo`;

    if (cacheV2[fullAddress]) {
        Logger.info("[GEOCODING][V2] Buscando do cache...");
        return cacheV2[fullAddress];
    }

    var url = "https://nominatim.openstreetmap.org/search";

    const queryString = new URLSearchParams({
        q: fullAddress,
        format: 'jsonv2',
    }).toString();
    const fullUrl = `${url}?${queryString}`;
    Logger.info(`[GEOCODING][V2] Buscando da web ${fullUrl}`);

    var response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
            'User-Agent': userAgent
        }
    });

   
    if (response.ok) {
         var data = await response.json();
         if (data.length > 0) {
            return data.map(({ lat, lon, display_name })=> {
                var data = {
                    lat,
                    long: lon,
                    fullAddress: display_name
                };

                cacheV2[fullAddress] = data;
                return data;
            });
         }

         throw {
            status: 404,
            message: "Endereço não encontrado no geocoding"
         }        
    }
    Logger.error(response.status, await response.text());
    throw new Error("Erro ao consultar serviço de GeoCoding");
}

const GeoCodingService = {
    getCoordinatesByAdress,
    getCoordinatesByAdressV2
}

export default GeoCodingService;