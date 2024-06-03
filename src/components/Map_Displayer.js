import { MapContainer, TileLayer, FeatureGroup, Polygon, Tooltip, useMap, Polyline } from 'react-leaflet';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { CoordinatesContext, RouteContext } from './CoordinatesContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRouteline } from '../features/routes/routeSlice';

function Map_Displayer() {
    const initialState = {
        long: 24.955,
        lat: 60.205,
        zoom: 15
    };
    const dispatch = useDispatch()
    const polygons = useSelector((state) => state.polygons);
    const routedata = useSelector((state) => state.routeLine);
    const [markerCount, setMarkerCount] = useState(0);
    const [startPosition, setStartPosition] = useState(null);
    const [destinationPosition, setDestinationPosition] = useState(null);
    const position = [initialState.lat, initialState.long];
    const mapRef = useRef();
    const featureGroupRef = useRef(null);
    const { setCoordinates } = useContext(CoordinatesContext);
    const { route, setRoute } = useContext(RouteContext);
    const droutedata = [
        [60.166623, 24.943873],
        [60.166685, 24.943877],
        [60.167213, 24.949522],
        [60.172733, 24.948691],
        [60.173842, 24.950136],
        [60.175803, 24.950303],
        [60.176888, 24.950199],
        [60.178422, 24.950647]
    ]
    let startposition=null;
    //{lat: '', lng: ''}
    let destinationposition=null;
    var markercount=0;

    const start_icon = new L.Icon({
        iconUrl: icon,
        //iconSize: [50, 50],
        iconAnchor: [13, 40],
        popupAnchor: [0, -30],
    });

    const destination_icon = new L.Icon({
        iconUrl: icon,
        //iconSize: [50, 50],
        iconAnchor: [13, 40],
        popupAnchor: [0, -30],
    });

    const onMarkerDragEnd = (e, type) => {
        const { lat, lng } = e.target.getLatLng();
        if (type === 'start') {
            startposition={ lat:lat, long:lng };
        } else if (type === 'destination') {
            destinationposition={ lat:lat, long:lng };
        }
        console.log(startPosition, destinationPosition, type, lat, lng)
        const newRoute = [
            { lat: startposition?.lat ?? lat, long: startposition?.long ?? lng },
            { lat: destinationposition?.lat ?? lat, long: destinationposition?.long ?? lng }
        ];
        setRoute(newRoute);
        if (newRoute.length === 2) {
            if (newRoute[0].lat !== undefined && newRoute[0].long !== undefined && newRoute[1].lat !== undefined && newRoute[1].long !== undefined) {
                console.log("marker drag end", newRoute)
                dispatch(fetchRouteline(newRoute));
            }
    };
    }

    const onDrawCreated = async (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const latLngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, long: latlng.long }));
            console.log(latLngs);
            setCoordinates(latLngs);

            if (featureGroupRef.current) {
                featureGroupRef.current.removeLayer(layer);
            }
        }
        if (layerType === 'marker') {
            const {lat, lng} = layer.getLatLng();
            console.log(lat, lng, markerCount, markercount);
            if (featureGroupRef.current) {
                featureGroupRef.current.removeLayer(layer);
                const map = mapRef.current;

                if (markercount === 0) {
                    setMarkerCount(prevCount =>prevCount + 1);
                    markercount++;
                    const startMarker = L.marker([lat, lng], { icon: start_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Start")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'start'));
                    setStartPosition({lat, lng});
                    startposition={ lat:lat, long:lng }
                    
                    await setRoute([startposition, destinationposition]);
                    console.log(startposition, destinationposition)
                } else if (markercount === 1) {
                    markercount++;
                    setMarkerCount(prevCount => prevCount + 1);
                    const destinationMarker = L.marker([lat,lng], { icon: destination_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Destination")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'destination'));
                    console.log(startPosition, destinationPosition)
                    setDestinationPosition({ lat,lng });
                    destinationposition={lat:lat,long:lng }
                    console.log("secondoneadded",startposition, destinationposition)
                    await setRoute([startposition, destinationposition]);
                    console.log(route)
                    
                            dispatch(fetchRouteline([startposition, destinationposition]));
                        
                
            }
        }
    }
    };

    const handleMouseOver = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: 'black',
            fillOpacity: 0.7
        });
    };

    const handleMouseOut = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: layer.options.originalColor,
            fillOpacity: 0.5
        });
    };

    return (
        <MapContainer
            center={position}
            zoom={initialState.zoom}
            scrollWheelZoom={true}
            style={{ flex: 1, width: '70%', marginTop: "0px" }}
            whenCreated={(map) => { mapRef.current = map; }}
            ref={mapRef}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routedata.slice().reverse().map((route, index) => (
                <Polyline key={index} positions={route.route} color={route.color} />
            ))}
            <FeatureGroup ref={featureGroupRef}>
                {polygons.map((polygon, index) => {
                    const color = polygon.type === 'roadblock' ? 'red' : 'orange';
                    return (
                        <Polygon
                            key={polygon.id}
                            positions={polygon.coordinates.map(coord => [coord.lat, coord.long])}
                            color={color}
                            fillOpacity={0.5}
                            eventHandlers={{
                                mouseover: handleMouseOver,
                                mouseout: handleMouseOut,
                            }}
                            originalColor={color} // Store original color for mouseout event
                        >
                            <Tooltip>{polygon.name}</Tooltip>
                        </Polygon>
                    );
                })}
                <EditControl
                    position="topright"
                    onCreated={onDrawCreated}
                    draw={{
                        rectangle: false,
                        polyline: false,
                        circle: false,
                        circlemarker: false,
                        marker: markerCount < 2 ? {
                            icon: start_icon
                        } : false // Allow drawing markers only if there are less than 2 markers
                    }}
                />
            </FeatureGroup>
        </MapContainer>
    );
}

export default Map_Displayer;