const fetchroute = async () => {
    try {
      const response = await fetch("polyline.json"); // Assuming data.json is in the public folder
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching routedata:", error);
      return [];
    }
  };
  


  function routeTransformer(jsonData) {
    console.log("received route data:", jsonData);
    let locations = [];
    
    jsonData.routes.forEach(route => {
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
                let location = step.maneuver.location;
                locations.push(location);
            });
        });
    });
    console.log(locations)
    return locations;
}

function routeGiver(coords) {
    return `${coords[0].long},${coords[0].lat};${coords[1].long},${coords[1].lat}`;
}
export {fetchroute, routeTransformer, routeGiver};

