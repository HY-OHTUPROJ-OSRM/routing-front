export const polylineToPolygon=(geoJson, width) =>{
    function getPerpendicularPoint(coord1, coord2, width, side) {
        const dx = coord2[0] - coord1[0];
        const dy = coord2[1] - coord1[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        const ux = (dx / length) * (width / 2);
        const uy = (dy / length) * (width / 2);

        if (side === 'left') {
            return [coord1[0] - uy, coord1[1] + ux];
        } else {
            return [coord1[0] + uy, coord1[1] - ux];
        }
    }

    const coordinates = geoJson.geometry.coordinates;
    const newCoordinates = [];
    const side = 'left';  // or 'right', depending on the desired side

    for (let i = 0; i < coordinates.length - 1; i++) {
        const newPoint = getPerpendicularPoint(coordinates[i], coordinates[i + 1], width, side);
        newCoordinates.push(newPoint);
    }

    // Add the original points and then the new points to close the polygon
    const polygonCoordinates = [...coordinates, ...newCoordinates];
    polygonCoordinates.push(coordinates[0])
    console.log(polygonCoordinates)
    return {
        type: "Feature",
        properties: geoJson.properties,
        geometry: {
            type: "Polygon",
            coordinates: [polygonCoordinates]
        }
    };
}

// Example usage:
const polylineGeoJson = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "LineString",
        coordinates: [
            [24.969182, 60.225455],
            [24.965834, 60.220555],
            [24.958538, 60.21591],
            [24.958366, 60.219362]
        ]
    }
};

const polygonGeoJson = polylineToPolygon(polylineGeoJson, 0.001); // width of 0.001 degrees
console.log(JSON.stringify(polygonGeoJson, null, 2));