
//Get duration and distance from received route data  
function routeInfoExtractor(jsonData) {
    let routes = [];
    jsonData.routes.forEach((route, routeIndex) => {
      routes.push({distance: route.distance, duration: route.duration});
      })
      return routes
  }
//extract route data from received json data to be displyed on map
function routeTransformer(jsonData) {
    //console.log("received route data:", jsonData);
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
            //color coding for primary and alternative routes
            color: routeIndex === 0 ? "#661e87":"#da72fc"
        });
    });
    return routes;
}


function routeFlip(arr) {
  return arr.map(item => [item[1], item[0]]);
}

function routeGiver(coords) {
    return `${coords[0].long},${coords[0].lat};${coords[1].long},${coords[1].lat}`;
}
export {routeTransformer, routeGiver, routeFlip, routeInfoExtractor};

