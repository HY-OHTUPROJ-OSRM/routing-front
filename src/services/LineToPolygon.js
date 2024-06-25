// Helper function to create a long narrow polygon
export const createNarrowPolygon = (polylineGeoJson, width) => {
    const { coordinates } = polylineGeoJson.geometry;
    const offsetCoordinates = [];
    const offsetCoordinates2 = [];
  
    // Function to calculate the offset coordinates. Used to approximate a polygon from a line
    const getOffsetCoord = (coord, bearing, distance) => {
      const R = 6378137; // Earth’s radius in meters
      const brng = bearing * (Math.PI / 180); // Convert bearing to radians
      const lat1 = coord[1] * (Math.PI / 180); // Current lat point converted to radians
      const lon1 = coord[0] * (Math.PI / 180); // Current long point converted to radians
  
      const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
        Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
      const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
        Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
  
      return [lon2 * (180 / Math.PI), lat2 * (180 / Math.PI)]; // Convert back to degrees
    };
  
    // Calculate left and right offsets for each line segment
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lon1, lat1] = coordinates[i];
      const [lon2, lat2] = coordinates[i + 1];
  
      const bearing = Math.atan2(lon2 - lon1, lat2 - lat1) * (180 / Math.PI);
      const leftBearing = bearing - 90;
      const rightBearing = bearing + 90;
  
      const leftOffsetStart = getOffsetCoord([lon1, lat1], leftBearing, width / 2);
      const rightOffsetStart = getOffsetCoord([lon1, lat1], rightBearing, width / 2);
      const leftOffsetEnd = getOffsetCoord([lon2, lat2], leftBearing, width / 2);
      const rightOffsetEnd = getOffsetCoord([lon2, lat2], rightBearing, width / 2);
  
      if (i === 0) {
        offsetCoordinates2.push(leftOffsetStart);
        offsetCoordinates.push(rightOffsetStart);
      }
  
      offsetCoordinates.push(rightOffsetEnd);
      offsetCoordinates2.push(leftOffsetEnd);
    }
    offsetCoordinates2.reverse().forEach(coord => offsetCoordinates.push(coord));
    // Close the polygon by adding the starting points to the end
    offsetCoordinates.push(offsetCoordinates[0]);
    return {
      type: "Feature",
      properties: {...polylineGeoJson.properties},
      geometry: {
        type: "Polygon",
        coordinates: [offsetCoordinates],
      },
    };
  };
  
export const PolygonToLine = (polygon) => {
    const coordinates = polygon.geometry.coordinates[0];
    if (coordinates.length % 2 !== 0) {
        coordinates.pop(); // Remove the last element if the number of coordinates is uneven
      }
      const halfLength = Math.floor(coordinates.length / 2);
      coordinates.slice(0, halfLength);
    const line = {
        type: "Feature",
        properties: {...polygon.properties},
        geometry: {
            type: "LineString",
            coordinates: coordinates.slice(0, halfLength),
        },
    };
    return line;
}