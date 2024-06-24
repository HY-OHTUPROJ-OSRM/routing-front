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
  
  function routeInfoExtractor(jsonData) {
    let routes = [];
    jsonData.routes.forEach((route, routeIndex) => {
      routes.push({distance: route.distance, duration: route.duration});
      })
      console.log("extractedinfo: ",routes)
      return routes
  }

  function routeTransformer(jsonData) {
    console.log("received route data:", jsonData);
    let routes = [];
    
    jsonData.routes.forEach((route, routeIndex) => {
        let locations = [];
        
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              step.geometry.coordinates.forEach(geom => {
                let location = geom;
                locations.push(location);
            });
          });
        });
        
        routes.push({
            route: routeFlip(locations),
            color: routeIndex === 0 ? "#661e87":"#da72fc"
        });
    });
    
    //console.log(routes);
    return routes;
}


function routeFlip(arr) {
  return arr.map(item => [item[1], item[0]]);
}

function routeGiver(coords) {
    return `${coords[0].long},${coords[0].lat};${coords[1].long},${coords[1].lat}`;
}
export {fetchroute, routeTransformer, routeGiver, routeFlip, routeInfoExtractor};

