import L from 'leaflet';
import { fetchRouteLine, setStartPosition as setStartDispatchPosition, setEndPosition as setDestinationDispatchPosition } from './routeSlice';

// A single coordinate class to handle all this shit
const Coordinates = class {
    constructor(dispatchCoordinatesSetter, routeUpdater, iconCoordinatesSetter, { dispatch }) {
        this._lat = null;
        this._lng = null;

        this._setDispatchCoordinates = dispatchCoordinatesSetter;
        this._updateRoute = routeUpdater;
        this._setIconCoordinates = iconCoordinatesSetter;
        
        this.dispatch = dispatch
    }

    setCoordinates({ lat, lng }) {
        this._lat = lat;
        this._lng = lng;

        this._setIconCoordinates(this);

        this.dispatch(this._setDispatchCoordinates(this));

        this._updateRoute();
    }

    // Make sure that we don't break stuff
    get lat() {
        return this._lat;
    }
    get lng() {
        return this._lng;
    }
    get long() {
        return this._lng;
    }
    set lat(value) {
        this.setCoordinates({ lat: value, lng: this.lng });
    }
    set lng(value) {
        this.setCoordinates({ lat: this.lat, lng: value });
    }
    set long(value) {
        this.setCoordinates({ lat: this.lat, lng: value });
    }
}

const Router = class {
    constructor({iconStart, iconDestination}, {mapRef, profileRef, dispatch, setRoute}) {
        this.startMarker = new Marker('Start position', iconStart, mapRef);
        this.destinationMarker = new Marker('Destination', iconDestination, mapRef);
        this.props = { dispatch, setRoute, profileRef, mapRef}
    }

    createStartMarker(coords) {
        const startCoords = new Coordinates(
            setStartDispatchPosition,
            this.updateRoute.bind(this),
            this.startMarker.setMarkerPosition.bind(this.startMarker),
            this.props
        );
        this.startMarker.createMarker(startCoords);
        this.startMarker.position.setCoordinates(coords);

        return this.startMarker
    }

    createDestinationMarker(coords) {
        const destinationCoords = new Coordinates(
            setDestinationDispatchPosition,
            this.updateRoute.bind(this),
            this.destinationMarker.setMarkerPosition.bind(this.destinationMarker),
            this.props
        );
        this.destinationMarker.createMarker(destinationCoords);
        this.destinationMarker.position.setCoordinates(coords);

        return this.destinationMarker
    }

    updateRoute() {
        const newRoute = [
            this.startMarker.position,
            this.destinationMarker.position
        ];
        this.props.setRoute(newRoute);

        console.log(this.startMarker, this.destinationMarker);

        if (newRoute[0] && newRoute[1]) {
            this.props.dispatch(fetchRouteLine(newRoute, this.props.profileRef.current))
        };
    }
}

const Marker = class {
    constructor(name, icon, mapRef) {
        this.name = name;
        this.icon = icon;
        this.position = null;

        this.marker = null;
        this.map = mapRef.current;

        this.setMarkerPosition = (coords) => {this.marker.setLatLng(coords)}
    }

    createMarker(coords) {
        // coords: Coordinates instance

        this.marker = L.marker([0, 0], { icon: this.icon, draggable: true })
            .addTo(this.map)
            .bindPopup(this.name)
            .on('dragend', (e) => {
                const newCoords = e.target.getLatLng();
                this.setPosition(newCoords);
            });
        
        console.log(coords)

        if (coords instanceof Coordinates) {
            this.position = coords;
        } else {
            throw new Error("Coordinates must be an instance of Coordinates class");
        }

        if (coords.lat != null && coords.lng != null) {
            this.setPosition(coords);
        }
    }

    setPosition({lat, lng}) {
        // coords: {lat, lng} or whatever
        if (!this.map) return;

        this.position.setCoordinates({ lat, lng });
    }
}

export default Router