//Get duration and distance from received route data
const routeInfoExtractor = (jsonData) => {
    const routes = [];
    jsonData.routes.forEach((route, routeIndex) => {
        routes.push({ distance: route.distance, duration: route.duration });
    });
    return routes;
};
//extract route data from received json data to be displyed on map
const routeTransformer = (jsonData) => {
    //console.log("received route data:", jsonData);
    const routes = [];

    jsonData.routes.forEach((route, routeIndex) => {
        const locations = [];

        route.legs.forEach((leg) => {
            leg.steps.forEach((step) => {
                step.geometry.coordinates.forEach((geom) => {
                    const location = geom;
                    locations.push(location);
                });
            });
        });

        routes.push({
            route: routeFlip(locations),
            //color coding for primary and alternative routes
            color: routeIndex === 0 ? '#661e87' : '#da72fc',
        });
    });
    return routes;
};

const routeFlip = (arr) => {
    return arr.map((item) => [item[1], item[0]]);
};

const routeGiver = (coords) => {
    return `${coords[0].long},${coords[0].lat};${coords[1].long},${coords[1].lat}`;
};
export { routeTransformer, routeGiver, routeFlip, routeInfoExtractor };
