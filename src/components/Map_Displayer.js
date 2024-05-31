import { MapContainer, TileLayer, FeatureGroup, Polygon, Tooltip, useMap } from 'react-leaflet';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { EditControl } from 'react-leaflet-draw';
import fetchPolygons from '../services/PolygonListService';
import { CoordinatesContext, RouteContext } from './CoordinatesContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function Map_Displayer() {
    const initialState = {
        lng: 24.955,
        lat: 60.205,
        zoom: 15
    };
    const [polygons, setPolygons] = useState([]);
    const [markerCount, setMarkerCount] = useState(0);
    const [startPosition, setStartPosition] = useState(null);
    const [destinationPosition, setDestinationPosition] = useState(null);
    const position = [initialState.lat, initialState.lng];
    const mapRef = useRef();
    const featureGroupRef = useRef(null);
    const { setCoordinates } = useContext(CoordinatesContext);
    const { route, setRoute } = useContext(RouteContext);
    var startposition=null;
    //{lat: '', lng: ''}
    var destinationposition=null;
    var markercount=0;

    const start_icon = new L.Icon({
        iconUrl: 'start.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
    });

    const destination_icon = new L.Icon({
        iconUrl: 'destination.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
    });

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchPolygons();
            setPolygons(data);
        };
        fetchData();
    }, []);

    const onMarkerDragEnd = (e, type) => {
        const { lat, lng } = e.target.getLatLng();
        if (type === 'start') {
            startposition={ lat, lng };
        } else if (type === 'destination') {
            destinationposition={ lat, lng };
        }
        console.log(startPosition, destinationPosition)
        const newRoute = [
            { lat: startposition?.lat ?? lat, lng: startposition?.lng ?? lng },
            { lat: destinationposition?.lat ?? lat, lng: destinationposition?.lng ?? lng }
        ];
        setRoute(newRoute);
    };

    const onDrawCreated = async (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const latLngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, long: latlng.lng }));
            console.log(latLngs);
            setCoordinates(latLngs);

            if (featureGroupRef.current) {
                featureGroupRef.current.removeLayer(layer);
            }
        }
        if (layerType === 'marker') {
            const latLng = layer.getLatLng();
            //console.log(latLng, markerCount, markercount);
            if (featureGroupRef.current) {
                featureGroupRef.current.removeLayer(layer);
                const map = mapRef.current;

                if (markercount === 0) {
                    setMarkerCount(prevCount =>prevCount + 1);
                    markercount++;
                    const startMarker = L.marker([latLng.lat, latLng.lng], { icon: start_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Start")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'start'));
                    setStartPosition({ lat: latLng.lat, lng: latLng.lng });
                    startposition={ lat: latLng.lat, lng: latLng.lng }
                    setRoute([{ lat: latLng.lat, lng: latLng.lng }, destinationposition]);
                    console.log(startPosition, destinationPosition)
                } else if (markercount === 1) {
                    markercount++;
                    setMarkerCount(prevCount => prevCount + 1);
                    const destinationMarker = L.marker([latLng.lat, latLng.lng], { icon: destination_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Destination")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'destination'));
                    console.log(startPosition, destinationPosition)
                    setDestinationPosition({ lat: latLng.lat, lng: latLng.lng });
                    destinationposition={ lat: latLng.lat, lng: latLng.lng }
                    setRoute([startposition, { lat: latLng.lat, lng: latLng.lng }]);
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
            <FeatureGroup ref={featureGroupRef}>
                {polygons.map((polygon, index) => {
                    const color = polygon.type === 'Roadblock' ? 'red' : 'orange';
                    return (
                        <Polygon
                            key={index}
                            positions={polygon.cords.map(coord => [coord.lat, coord.lng])}
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
                        marker: markerCount < 2 // Allow drawing markers only if there are less than 2 markers
                    }}
                />
            </FeatureGroup>
        </MapContainer>
    );
}

export default Map_Displayer;