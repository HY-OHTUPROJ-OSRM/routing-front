

import React, { useEffect, useRef, useState } from 'react';
import './my-map.scss';
import L from 'leaflet';
import fetchPolygons from "../services/PolygonListService";

function MyMap() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPolygons();
      setPolygons(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const initialState = {
      lng: 24.955,
      lat: 60.205,
      zoom: 15
    };
    var latlngs = [[60.207, 24.963],[60.204, 24.957],[60.202,24.961],[60.205,24.967]];

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current).setView([initialState.lat, initialState.lng], initialState.zoom);

      const myAPIKey = 'b4b00923110546ceb93813fec73ed9ec';
      const isRetina = L.Browser.retina;
      const baseUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${myAPIKey}`;
      const retinaUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey=${myAPIKey}`;
    
      L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap <a href="https://www.openstreetmap.org/copyright" target="_blank">contributors</a>',
        apiKey: myAPIKey,
        maxZoom: 20,
        id: 'osm-bright',
      }).addTo(mapInstance.current);

    }
    var polygon = L.polygon(latlngs, {color: 'red'}).addTo(mapInstance.current);
    if (polygons){
    var polylist=polygons.map(polygon => {
      const latlngs = polygon.cords.map(coord => [coord.lat, coord.lng]);
      return L.polygon(latlngs, { color: 'red' }).addTo(mapInstance.current);
    });
  };

    // Clean up the map instance when the component unmounts
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        //polygon.remove()
        mapInstance.current = null;
      }
    };
  }, [polygons]);

  return (
    <div className="map-container" ref={mapContainer} style={{ height: '500px' }}></div>
  );
}

export default MyMap;
