import { MapContainer, TileLayer, FeatureGroup, Polygon, Tooltip, useMap, Polyline, GeoJSON, useMapEvent } from 'react-leaflet';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { CoordinatesContext, RouteContext } from './CoordinatesContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { fetchRouteLine, setStartPosition, setEndPosition } from '../features/routes/routeSlice';
import { useDispatch, useSelector } from 'react-redux';
import 'leaflet-editable';
import ReactLeafletEditable from 'react-leaflet-editable';
import { setModifiedPolygons, addPolygon, modifyPolygon, setFaults } from '../features/polygons/modifiedPolygonsSlice';
import { v4 as uuidv4 } from 'uuid';
import { ChangePolygons } from '../services/PolygonService';
import { fetchPolygons } from '../features/polygons/polygonsSlice';
import "./Polygon.css"
import { generateName } from '../services/nameGiverService';
import { showTimedAlert } from '../Utils/dispatchUtility';
import { intersectSelf } from '../services/Intersect_self';
import { geometry } from '@turf/turf';
import {startti_icon, desti_icon} from './leafletHTMLIcon';
import { changeListView } from '../features/view/ViewSlice';
function Map_Displayer({editMode, setEditMode, setSidebar, isOpen}) {
    const dispatch = useDispatch()
    const initialState = {
        long: 24.955,
        lat: 60.205,
        zoom: 15
    };
    const routedata = useSelector((state) => state.routeLine.routeLine);
    const calcelEditIds = useSelector((state) => state.modifiedPolygons.cancelSendIds);
    const cansave =useSelector((state) => state.modifiedPolygons.faultval)
    const position = [initialState.lat, initialState.long];
    const [editing, setEditing] = useState(false)
    const polygons = useSelector((state) => state.polygons)
    const segments = useSelector((state) => state.segments)
    const modifiedPolygons = useSelector((state) => state.modifiedPolygons.polygons)
    const sendIds = useSelector((state) => state.modifiedPolygons.sendIds)
    const deleteIds = useSelector((state) => state.modifiedPolygons.deleteIds)
    const [markerCount, setMarkerCount] = useState(0);
    const [Lines, setLines] = useState(0);
    const editRef = useRef();
    const mapRef = useRef();
    const zonesRef = useRef(null);
    const editingZonesRef = useRef(null);
    const { setCoordinates } = useContext(CoordinatesContext);
    const { route, setRoute } = useContext(RouteContext);
    const mapView = useSelector((state) => state.view.mapView);
    let mountingHelper=0
    let startposition=null;
    let maphelp=null
    //{lat: '', lng: ''}
    let destinationposition=null;
    var markercount=0;

    const start_icon = new L.Icon({
        iconUrl: require('../img/amb.webp'),
        //iconUrl: icon,
        //iconUrl: startti_icon,
        iconSize: [60, 60],
        iconAnchor: [30, 40],
        popupAnchor: [0, -30],
    });

    const destination_icon = new L.Icon({
        iconUrl: require('../img/goal.png'),
        //iconUrl: icon,
        iconSize: [40, 40],
        iconAnchor: [11, 38],
        //iconAnchor: [13, 40],
        popupAnchor: [0, -30],
    });
    const placehold_icon = new L.Icon({
        iconUrl: icon,
        iconSize: [25, 41],
        iconAnchor: [13, 40],
        popupAnchor: [0, -30],
    });
    const onMarkerDragEnd = (e, type) => {
        const { lat, lng } = e.target.getLatLng();
        console.log("segments", segments);
        if (type === 'start') {

            startposition={ lat:lat, long:lng };
            dispatch(setStartPosition(startposition));
        } else if (type === 'destination') {
            destinationposition={ lat:lat, long:lng };
            dispatch(setEndPosition(destinationposition));
        }
        //console.log(startPosition, destinationPosition, type, lat, lng)
        const newRoute = [
            { lat: startposition?.lat ?? lat, long: startposition?.long ?? lng },
            { lat: destinationposition?.lat ?? lat, long: destinationposition?.long ?? lng }
        ];
        setRoute(newRoute);
        if (newRoute.length === 2) {
            if (newRoute[0].lat !== undefined && newRoute[0].long !== undefined && newRoute[1].lat !== undefined && newRoute[1].long !== undefined) {
                console.log("marker drag end", newRoute)
                dispatch(fetchRouteLine());
            }
    };
    }



    const onDrawCreated = async (e) => {
        const { layerType, layer } = e;
        console.log("drawcreated", e, layerType, layer)
        if (layerType === 'polygon' || layerType === 'Linestring') {
            console.log(layer.getLatLngs()[0].map(latlng => ([latlng.lat, latlng.lng])))
            const cords={geometry: {type: "Polygon", coordinates: [layer.getLatLngs()[0].map(latlng => ([latlng.lng, latlng.lat]))]}};
            cords.geometry.coordinates[0].push(cords.geometry.coordinates[0][0]);
            const latLngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, long: latlng.lng }));
            console.log(latLngs);
            if (!intersectSelf(cords)) {
            setCoordinates(latLngs);
            }
            if (zonesRef.current) {
                zonesRef.current.removeLayer(layer);
            }
        }
        if (layerType === 'marker') {
            const {lat, lng} = layer.getLatLng();
            console.log(lat, lng, markerCount, markercount);
            if (zonesRef.current) {
                zonesRef.current.removeLayer(layer);
                const map = mapRef.current;

                if (markercount === 0) {
                    setMarkerCount(prevCount =>prevCount + 1);
                    markercount++;
                    const startMarker = L.marker([lat, lng], { icon: startti_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Start")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'start'));
                    
                    startposition={ lat:lat, long:lng }
                    dispatch(setStartPosition(startposition));
                    
                    await setRoute([startposition, destinationposition]);
                    console.log(startposition, destinationposition)
                } else if (markercount === 1) {
                    markercount++;
                    setMarkerCount(prevCount => prevCount + 1);
                    const destinationMarker = L.marker([lat,lng], { icon: desti_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Destination")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'destination'));
                    //console.log(startPosition, destinationPosition)
                    
                    destinationposition={lat:lat,long:lng }
                    dispatch(setEndPosition(destinationposition));
                    console.log("secondoneadded",startposition, destinationposition)
                    await setRoute([startposition, destinationposition]);
                    console.log(route)
                    
                            dispatch(fetchRouteLine([startposition, destinationposition]));
                        
                
            }
        }
    }
    };

    const handleMouseOver = (e) => {
        console.log("joo", e)
        const layer = e.target;
        layer.setStyle({
            fillColor: 'black',
            fillOpacity: 0.7
        });
        if (editMode){
        onClickHandler(e.target.options);
        }
    };

    const handleMouseOut = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: layer.options.originalColor,
            fillOpacity: 0.5
        });
    };

    const enableEditMode = () => {
        if (!isOpen)    {
        setSidebar(true)
        }
        setEditing(true)
        setEditMode(true)
        console.log("editmode map_disp", editMode)
        dispatch(setModifiedPolygons(polygons))
        if (Lines) {
            editRef.current.startPolyline()
        } else {
            editRef.current.startPolygon()
        }
    }

    const cancelEdits = () => {
        //remove all tracked faults as data resets on cancel
        dispatch(setFaults({id: 0, type: 2}))
        dispatch(changeListView(null));
        setEditing(false)
        setEditMode(false)
        setLines(0)
        setSidebar(false)
        editRef.current.props.map.editTools.stopDrawing()
    }


    const onDrawingCommit = (shape) => {
        const geoJSON = shape.layer.toGeoJSON()
        console.log("shape", shape)
        geoJSON.properties = {
            name: generateName(),
            IsLine: Lines,
            type: "roadblock",
            id: uuidv4()
        }
        if (geoJSON.properties.IsLine){
            console.log("line", geoJSON)
        }
        shape.layer.remove()
        if (!intersectSelf(geoJSON)) {
            dispatch(addPolygon(geoJSON))
        } else {
            editRef.current.props.map.editTools.stopDrawing()
           if (Lines) {
            editRef.current.startPolyline()
           } else {
            editRef.current.startPolygon()
           }
        }
        //console.log(modifiedPolygons)
    }

    const onCancelDrawing = (e) => {
        
        e.layer.remove()
    }


    const saveEdits = async () => {
        console.log("canceledit", calcelEditIds)
        console.log(modifiedPolygons)
        console.log(deleteIds)
        dispatch(changeListView(null));
        const added = Object.values(modifiedPolygons).filter(zone => 
            Object.keys(sendIds).includes(String(zone.properties.id)) &&
            !Object.keys(calcelEditIds).includes(String(zone.properties.id))
        );
        console.log(added)
        
        editRef.current.props.map.editTools.stopDrawing()
        await ChangePolygons(added, Object.keys(deleteIds))
        setEditMode(false)
        setEditing(false)
        setLines(0)
        setSidebar(false)
        dispatch(fetchPolygons())
        dispatch(fetchRouteLine())
        cancelEdits()
    }

    const onClickHandler = (properties) => {
        if (!isOpen) {
        setSidebar(true)
        isOpen = true
        } else{
        dispatch(changeListView(properties.id));
        }
        console.log("clicked",isOpen, properties)
      };
    
      const setupClickListener = (layer) => {
        if (!layer.listens("click")) {
          layer.on("click", (e) => {
            onClickHandler(e.layer.feature.properties);
          });
        }
      };
    
      const enableLayerEdits = () => {
        console.log("enabled edit start");
        if (editingZonesRef.current !== null) {
          console.log(editingZonesRef.current.getLayers());
          editingZonesRef.current.getLayers().forEach((layer) => {
            //console.log(layer);
            layer.disableEdit();
            layer.enableEdit();
    
            if (!layer.listens("editable:vertex:dragend")) {
              layer.on("editable:vertex:dragend", (e) => {
                const { name, type, id, IsLine } = e.layer.options;
                const geoJSON = e.layer.toGeoJSON();
                console.log("dragend", e);
                //onClickHandler(e.layer.options);
    
                geoJSON.properties = {
                  name, type, id, IsLine
                };
                if(!intersectSelf(geoJSON)){
                dispatch(modifyPolygon(geoJSON));
                }
              });
            }
    
            setupClickListener(layer);
          });
        }
    
        if (editing && editRef.current != null) {
          if (!editRef.current.props.map?.editTools?.drawing()) {
            if (Lines) {
              editRef.current.startPolyline();
            } else {
              editRef.current.startPolygon();
            }
          }
        }
        console.log("enabled edit complete");
      };
    
      useEffect(() => {
        if (zonesRef.current !== null) {
            console.log("setting up click listeners");
          zonesRef.current.getLayers().forEach(setupClickListener);
        }
      }, [polygons, modifiedPolygons, editingZonesRef.current, mountingHelper]);

    useEffect(enableLayerEdits)

    const geoJsonStyle = (feature) => {
        return {
          color: feature.properties.type === 'roadblock' ? 'red' : 'orange',
          fillOpacity: 0.5
        };
      };
    
      const onEachFeature = (feature, layer) => {
        layer.on({
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
        });
    
        if (feature.properties && feature.properties.name) {
          layer.bindTooltip(feature.properties.name);
        }
      };

    const ChangeLines= () => {
        setLines(1)
        editRef.current.props.map.editTools.stopDrawing()
        editRef.current.startPolyline()
    }
    const ChangedrawPolygons= () => {
        console.log(Lines)
        setLines(0)
        editRef.current.props.map.editTools.stopDrawing()
        editRef.current.startPolygon()
 

    }

    function handleOnFlyTo() {
        
        const { leafletElement: map } = mapRef;
        if (mapView.center!==undefined){
        mapRef.current.flyTo(mapView.center, mapView.zoom, {
          duration: 1
        });
        }
      }
    useEffect(() => {
        handleOnFlyTo();
      }, [mapView]);
    

      const ClickHandler = () => {
        useMapEvent('click', (event) => {
           let {lat, lng} = event.latlng;
           const map = mapRef.current;
          if (markerCount ===0){
            setMarkerCount(prevCount => prevCount + 1);
            markercount++;
            const startMarker = L.marker([lat, lng], { icon: startti_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Start")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'start'));
                    
                    startposition={ lat:lat, long:lng }
                    dispatch(setStartPosition(startposition));
                    
                    setRoute([startposition, destinationposition]);
                    console.log(startposition, destinationposition)
            } else if (markerCount === 1) {
                    markercount++;
                    setMarkerCount(prevCount => prevCount + 1);
                    const destinationMarker = L.marker([lat,lng], { icon: desti_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Destination")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'destination'));
                    //console.log(startPosition, destinationPosition)
                    
                    destinationposition={lat:lat,long:lng }
                    dispatch(setEndPosition(destinationposition));
                    console.log("secondoneadded",startposition, destinationposition)
                    setRoute([startposition, destinationposition]);
                    console.log(route)
                    
                            dispatch(fetchRouteLine());
          }
        });
        return null;
      };
      
        const handleClick = (event) => {
          console.log('Map clicked at:', event.latlng);
        };

    return (
        <ReactLeafletEditable
            ref={editRef}
            map={mapRef.current}
            onDrawingCommit={onDrawingCommit}
            onCancelDrawing={onCancelDrawing}
            
        >
        <MapContainer
            editable={true}
            center={position}
            zoom={initialState.zoom}
            scrollWheelZoom={true}
            style={{ flex: 1, width: '70%', height: "95%", marginTop: "-40px", zIndex: 0}}
            whenCreated={(map) => { mapRef.current = map; }}
            ref={mapRef}
        >   
            <div className="edit-pane">
                <button
                    hidden={editing}
                    onClick={enableEditMode}
                    className="edit-button"
                >Edit</button>
                {cansave !== 0 && (
                    <div className="alert-message">
                        Some changes are forbidden
                    </div>
                )}

                <button
                    hidden={!editing}
                    disabled={cansave !== 0}
                    onClick={saveEdits}
                    className="edit-button"
                >
                    Save
                </button>
                <button
                    hidden={!editing}
                    onClick={cancelEdits}
                    className="edit-button"
                >Cancel</button>
                
                {Lines === 0 ? (
                <button
                    hidden={!editing}
                    disabled={!editing}
                    onClick={() => ChangeLines()}
                    className="toggle-button"
                >
                    Change to Lines
                </button>
            ) : (
                <button
                    hidden={!editing}
                    onClick={() => ChangedrawPolygons()}
                    className="toggle-button"
                >
                    Change to Polygons
                </button>
            )}
            </div>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routedata.slice().reverse().map((route, index) => (

                <Polyline key={index} positions={route.route} color={route.color} pathOptions={{
            color: route.color, 
            zIndex: route.color === 'blue' ? 1000 : undefined
          }}  />
            ))}
            {segments.map((segment, index) => (
                
                <Polyline
                key={index}
                id={segment.id}
                positions={segment.map(point => [point.lat, point.lon])}
                color="red"
                >
                <Tooltip>
                {"ids: " + segment.map(point => point.id).join(' ') + 
                " difference: " + Math.abs(segment[0].id - segment[1].id)}
                </Tooltip>
                </Polyline>
            ))}
            {editing 
            ?
            <FeatureGroup ref={editingZonesRef}>
                {(Object.values(modifiedPolygons).map((polygon, index) => {
                    const color = 'orangeRed';
                    //console.log("jepoe", polygon, polygon.geometry.coordinates[0].map(coord => [coord[1], coord[0]]))
                    if (polygon.properties.IsLine === 1) {
                    return (
                       

                        <Polyline
                            key={polygon.properties.id}
                            id={polygon.properties.id}
                            name={polygon.properties.name}
                            type={polygon.properties.type}
                            IsLine={polygon.properties.IsLine}
                            positions={polygon.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                            color={color}
                            fillOpacity={0.5}
                            weight={7}
                            width={7}
                            eventHandlers={{
                                mouseover: handleMouseOver,
                                mouseout: handleMouseOut,
                            }}
                            originalColor={color} // Store original color for mouseout event
                        >
                            <Tooltip>{polygon.properties.name}</Tooltip>
                        </Polyline>
                    )
                    } else {
                        return (
                        <Polygon
                            key={polygon.properties.id}
                            id={polygon.properties.id}
                            name={polygon.properties.name}
                            type={polygon.properties.type}
                            positions={polygon.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                            color={color}
                            fillOpacity={0.5}
                            eventHandlers={{
                                mouseover: handleMouseOver,
                                mouseout: handleMouseOut,
                            }}
                            originalColor={color} // Store original color for mouseout event
                        >
                            <Tooltip>{polygon.properties.name}</Tooltip>
                        </Polygon>
                        
                    
                    )};
                mountingHelper=1;
                }))}
                {console.log("Completed rendering all polygons for this round.")}
            </FeatureGroup>
            :
            <FeatureGroup ref={zonesRef}>
                {polygons.map((feature, index) => (
                    <GeoJSON
                        key={feature.properties.id}
                        data={feature}
                        style={geoJsonStyle}
                        onEachFeature={onEachFeature}
                    />
                ))}
                <EditControl
                    position="topright"
                    onCreated={onDrawCreated}
                    draw={{
                        rectangle: false,
                        polyline: false,
                        circle: false,
                        circlemarker: false,
                        marker: markerCount < 2 ? {
                            icon: placehold_icon
                        } : false // Allow drawing markers only if there are less than 2 markers
                    }}
                />
            </FeatureGroup>}
        <ClickHandler onClick={handleClick} />
        </MapContainer>
        </ReactLeafletEditable>
    );
}

export default Map_Displayer;