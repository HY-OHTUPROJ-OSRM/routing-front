import { MapContainer, TileLayer, FeatureGroup, Polygon, Tooltip } from 'react-leaflet';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { EditControl } from 'react-leaflet-draw';
import fetchPolygons from '../services/PolygonListService';
import { CoordinatesContext, RouteContext } from './CoordinatesContext';


function Map_Displayer() {
    const initialState = {
        lng: 24.955,
        lat: 60.205,
        zoom: 15
    };
    const [polygons, setPolygons] = useState([]);
    const position = [initialState.lat, initialState.lng];
    const mapRef = useRef(null);
    const featureGroupRef = useRef(null);
    const { setCoordinates } = useContext(CoordinatesContext);
    const { setRoute } = useContext(RouteContext);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchPolygons();
            setPolygons(data);
        };
        fetchData();
    }, []);

    const onDrawCreated = (e) => {
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
            console.log(latLng);
            setRoute([{ lat: latLng.lat, long: latLng.lng }]);
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
                        marker: true
                    }}
                />
            </FeatureGroup>
        </MapContainer>
    );
}

export default Map_Displayer;