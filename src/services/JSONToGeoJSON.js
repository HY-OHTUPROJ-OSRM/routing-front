function convertToGeoJSON(dataList) {
    dataList.coordinates.push( dataList.coordinates[0] );
    console.log(dataList)
    dataList=[dataList] //remove when add functionality is changed to add all polygons on new being created
    const geoJSON = {
        type: "FeatureCollection",
        features: dataList.map(data => ({
            type: "Feature",
            properties: {
                name: data.name,
                type: data.type,
                id: data.id,
                speed_effect: data.severity
            },
            geometry: {
                type: "Polygon",
                coordinates: [data.coordinates.map(coord => [parseFloat(coord.long), parseFloat(coord.lat)])]
            }
        }))
    };
    return geoJSON;
};



function convertToJSON(geoJSON) {
    const data = geoJSON.features.map(feature => ({
        name: feature.properties.name,
        type: feature.properties.type,
        coordinates: feature.geometry.coordinates[0].map(coord => ({
            long: coord[0],
            lat: coord[1]
        })),
        id: feature.properties.id
    }));
    console.log('jaa', [data])
    return data;
}


function filterUUIDv4(list) {
    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return list.filter(item => !isNaN(Number(item)));
  }

export { convertToGeoJSON, convertToJSON, filterUUIDv4};