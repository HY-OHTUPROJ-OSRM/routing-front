function convertToGeoJSON(data) {
    const geoJSON = {
        type: "FeatureCollection",
        features: [
          {
        
        properties: {
            name: data.name,
            type: data.type
        },
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [data.coordinates.map(coord => [coord.long, coord.lat])]
        }
    }
        ]
    };
    return geoJSON;
}

export default convertToGeoJSON;