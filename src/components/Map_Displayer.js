import { MapContainer, FeatureGroup, Polygon, Tooltip, Polyline, GeoJSON, useMapEvent } from 'react-leaflet';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { CoordinatesContext, RouteContext } from './CoordinatesContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
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
import { getColorAndOpacity } from '../services/PolygonVisualService';
import {startti_icon, desti_icon} from './leafletHTMLIcon';
import { changeListView } from '../features/view/ViewSlice';
import VectorTileLayer from "react-leaflet-vector-tile-layer";
import roadStyle from '../roadStyle';
import { refreshTileLayer } from '../features/map/tileLayerSlice';

/* 
Massive component handling all map functionalities. 
*/


function Map_Displayer({editMode, setEditMode, setSidebar, isOpen}) {
    const dispatch = useDispatch()
    const initialState = {
        long: 24.955,
        lat: 60.205,
        zoom: 15
    };
    //Variable for tracking if user is hovering over the edit button. Used to prevent marker placement when edit button is clicked
    const [editHover, setEditHover]=useState(false)
    // Variable containing geometry of the generated route(s)
    const routedata = useSelector((state) => state.routeLine.routeLine);
    //Variable used to make sure polygons set to be deleted are not re created on when save is clicked
    const calcelEditIds = useSelector((state) => state.modifiedPolygons.cancelSendIds);
    //Variable used to make sure all changes are valid before saving, if not save cannot be clicked
    const cansave =useSelector((state) => state.modifiedPolygons.faultval)
    //Initial position of the map view
    const position = [initialState.lat, initialState.long];
    //Variable for tracking if user is in editing mode
    const [editing, setEditing] = useState(false)
    //Variable containing all polygons received from the backend
    const polygons = useSelector((state) => state.polygons)
    //Currently not used. Could be used if user want to see all segments on the map affected by polygons
    const segments = useSelector((state) => state.segments)
    //Same as polygon but used in editmode
    const modifiedPolygons = useSelector((state) => state.modifiedPolygons.polygons)
    //Variable for tracking all polygon to be sent to backend when save is clicked
    const sendIds = useSelector((state) => state.modifiedPolygons.sendIds)
    //Variable for tracking all polygon to be deleted when save is clicked
    const deleteIds = useSelector((state) => state.modifiedPolygons.deleteIds)
    //Variable used to track amount of markers placed on the map. Used to track whether placed marker should be start or end position and if both already exist no marker should be placed
    const [markerCount, setMarkerCount] = useState(0);
    //Variable for tracking if user is drawing lines or polygons
    const [Lines, setLines] = useState(0);
    //Reference to the leaflet edit functionalities
    const editRef = useRef();
    //Reference to the map component of leaflet
    const mapRef = useRef();
    //Reference to the polygons drawn on the map outside of editmode
    const zonesRef = useRef(null);
    //Reference to the polygons drawn on the map inside of editmode
    const editingZonesRef = useRef(null);
    //context replaced by redux in most places, but may still be used in some spots
    const { setCoordinates } = useContext(CoordinatesContext);
    const { route, setRoute } = useContext(RouteContext);
    //Variable for changing map view when new view is requested from list component
    const mapView = useSelector((state) => state.view.mapView);
    // For refreshing the VectorTileLayer
    const tileLayer = useSelector((state) => state.tileLayer)
    let mountingHelper=0
    let startposition=null;
    let maphelp=null
    let originalLatLngs = 0;
    //{lat: '', lng: ''}
    let destinationposition=null;
    var markercount=0;
    const [updateFlag, setUpdateFlag] = useState(false);
    //Alternative start icon replaced with html marker
    const start_icon = new L.Icon({
        iconUrl: require('../img/amb.webp'),
        //iconUrl: icon,
        //iconUrl: startti_icon,
        iconSize: [60, 60],
        iconAnchor: [30, 40],
        popupAnchor: [0, -30],
    });
    //Alternative destination icon replaced with html marker
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
    //Function for updating start/destination position when corresponding marker is dragged
    const onMarkerDragEnd = (e, type) => {
        const { lat, lng } = e.target.getLatLng();
        if (type === 'start') {
            startposition={ lat:lat, long:lng };
            dispatch(setStartPosition(startposition));
        } else if (type === 'destination') {
            destinationposition={ lat:lat, long:lng };
            dispatch(setEndPosition(destinationposition));
        }
        const newRoute = [
            { lat: startposition?.lat ?? lat, long: startposition?.long ?? lng },
            { lat: destinationposition?.lat ?? lat, long: destinationposition?.long ?? lng }
        ];
        setRoute(newRoute);
        if (newRoute.length === 2) {
            if (newRoute[0].lat !== undefined && newRoute[0].long !== undefined && newRoute[1].lat !== undefined && newRoute[1].long !== undefined) {
                dispatch(fetchRouteLine());
            }
        };
    }

    //Used when a new polygon/line is drawn. Marker functionalities are handled elsewhere so these functionalities may be removed
    const onDrawCreated = async (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon' || layerType === 'Linestring') {
            const cords={geometry: {type: "Polygon", coordinates: [layer.getLatLngs()[0].map(latlng => ([latlng.lng, latlng.lat]))]}};
            cords.geometry.coordinates[0].push(cords.geometry.coordinates[0][0]);
            const latLngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, long: latlng.lng }));
            if (!intersectSelf(cords)) {
            setCoordinates(latLngs);
            }
            if (zonesRef.current) {
                zonesRef.current.removeLayer(layer);
            }
        }
        if (layerType === 'marker') {
            const {lat, lng} = layer.getLatLng();
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
                } else if (markercount === 1) {
                    markercount++;
                    setMarkerCount(prevCount => prevCount + 1);
                    const destinationMarker = L.marker([lat,lng], { icon: desti_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Destination")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'destination'));
                    
                    destinationposition={lat:lat,long:lng }
                    dispatch(setEndPosition(destinationposition));
  
                    await setRoute([startposition, destinationposition]);
                    
                    dispatch(fetchRouteLine([startposition, destinationposition]));
                        
                
            }
        }
    }
    };
    //Used when user hovers over a polygon/line
    const handleMouseOver = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: 'black',
            fillOpacity: 0.7
        });
        if (editMode){
        onClickHandler(e.target.options);
        }
    };
    //Used when user stops hovering over a polygon/line
    const handleMouseOut = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: layer.options.originalColor,
            fillOpacity: 0.5
        });
    };
    //Used when changing to editmode
    const enableEditMode = () => {
        if (!isOpen)    {
        dispatch(changeListView(null));
        setSidebar(true)
        }
        setEditing(true)
        setEditMode(true)
        dispatch(setModifiedPolygons(polygons))
        if (Lines) {
            editRef.current.startPolyline()
        } else {
            editRef.current.startPolygon()
        }
    }
    //Used when canceling editmode
    const cancelEdits = () => {
        //remove all tracked faults as data resets on cancel
        dispatch(setFaults({id: 0, type: 2}))
        dispatch(changeListView(null));
        setEditing(false)
        setEditMode(false)
        setLines(0)
        if (isOpen) {
        setSidebar(false)
        }
        editRef.current.props.map.editTools.stopDrawing()
    }

    //Used when a new polygon is drawn in editmode
    const onDrawingCommit = (shape) => {
        const geoJSON = shape.layer.toGeoJSON()
        geoJSON.properties = {
            name: generateName(),
            IsLine: Lines,
            type: "roadblock",
            id: uuidv4()
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
    }

    const onCancelDrawing = (e) => {
        e.layer.remove()
    }

    //Used when saving edits. sends all added/deleted polygons to the backend and updates the map with new polygons and new route
    const saveEdits = async () => {
        //console.log("modified polygons", modifiedPolygons)
        //console.log("delete ids", deleteIds)
        dispatch(changeListView(null));
        const added = Object.values(modifiedPolygons).filter(zone => 
            Object.keys(sendIds).includes(String(zone.properties.id)) &&
            !Object.keys(calcelEditIds).includes(String(zone.properties.id))
        );
        //console.log("added", added)
        
        editRef.current.props.map.editTools.stopDrawing()
        await ChangePolygons(added, Object.keys(deleteIds))
        setEditMode(false)
        setEditing(false)
        setLines(0)
        setSidebar(false)
        dispatch(refreshTileLayer())
        dispatch(fetchPolygons())
        dispatch(fetchRouteLine())
        cancelEdits()
    }
    //Used to change the list view when a polygon is clicked on map
    const onClickHandler = (properties) => {
        if (!isOpen)    {
        setSidebar(true)
        }
        dispatch(changeListView(properties.id));
      };
    
      const setupClickListener = (layer) => {
        if (!layer.listens("click")) {
          layer.on("click", (e) => {
            onClickHandler(e.layer.feature.properties);
          });
        }
      };
    //Used to update polygon when user edits an already drawn polygon by draggin its vertices in editmode
      const enableLayerEdits = () => {
        if (editingZonesRef.current !== null) {
          editingZonesRef.current.getLayers().forEach((layer) => {
            layer.disableEdit();
            layer.enableEdit();
            if (!layer.listens("editable:vertex:dragstart")) {
            layer.on("editable:vertex:dragstart", (e) => {
                // Store the original coordinates before drag starts
               originalLatLngs = layer.getLatLngs();
               //console.log(layer.getLatLngs(), originalLatLngs)
              });
            }
            if (!layer.listens("editable:vertex:dragend")) {
              layer.on("editable:vertex:dragend", (e) => {
                const { name, type, id, IsLine, effectValue } = e.layer.options;
                const geoJSON = e.layer.toGeoJSON();
                geoJSON.properties = {
                  name, type, id, IsLine, effectValue
                };
                if(!intersectSelf(geoJSON)){
                    dispatch(modifyPolygon(geoJSON));
                } else {
                    layer.setLatLngs(originalLatLngs);
                    layer.redraw()
                    setUpdateFlag((prev) => !prev);
                    showTimedAlert({ text: "Polygon can't intersect itself", variant: 'failure'});
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
      };
      //UseEffect used to enable click listeners for all polygons.
      useEffect(() => {
        if (zonesRef.current !== null) {
          zonesRef.current.getLayers().forEach(setupClickListener);
        }
      }, [polygons, modifiedPolygons, editingZonesRef.current, mountingHelper]);

    useEffect(enableLayerEdits)

    //Generates the color and opacity for the polygons based on their type and effect value. Used outside of editmode
    const geoJsonStyle = (feature) => {
        let {color, opacity} = getColorAndOpacity(feature.properties.type, feature.properties.effect_value);
        if(!Number(opacity)){
            opacity=0.5
        }
        return {
          color: color,
          fillOpacity: opacity
        };
      };
      //Adds hover listeners to each polygon/line. Used outside of editmode
      const onEachFeature = (feature, layer) => {
        layer.on({
          mouseover: handleMouseOver,
          mouseout: handleMouseOut,
        });
    
        if (feature.properties.type && feature.properties.name) {
          layer.bindTooltip(`${feature.properties.name} | ${feature.properties.type}`);
        }
      };
    //Toggle to use lines instead of polygons when drawing
    const ChangeLines= () => {
        setLines(1)
        editRef.current.props.map.editTools.stopDrawing()
        editRef.current.startPolyline()
    }
    //Toggle to use polygons instead of lines when drawing
    const ChangedrawPolygons= () => {
        //console.log(Lines)
        setLines(0)
        editRef.current.props.map.editTools.stopDrawing()
        editRef.current.startPolygon()
 

    }
    //Used to change view to the center of the selected polygon/line
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
    
    //Used to place start and destination positions on the map when user clicks on the map. If in editmode or hovering over edit button, a marker will not be placed
    const ClickHandler = () => {

        useMapEvent('click', (event) => {
           let {lat, lng} = event.latlng;
           const map = mapRef.current;
           if (editMode || editHover){
            return null
           } 
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
            } else if (markerCount === 1) {
                    markercount++;
                    setMarkerCount(prevCount => prevCount + 1);
                    const destinationMarker = L.marker([lat,lng], { icon: desti_icon, draggable: true })
                        .addTo(map)
                        .bindPopup("Destination")
                        .on('dragend', (e) => onMarkerDragEnd(e, 'destination'));
                    
                    destinationposition={lat:lat,long:lng }
                    dispatch(setEndPosition(destinationposition));
                    setRoute([startposition, destinationposition]);
                    dispatch(fetchRouteLine());
          }
        });
        return null;
      };
      
    const handleClick = (event) => {
        };

        //Used to bring route polylines to the front, so that the polylines are not hidden by polygons
    useEffect(() => {
            let map=mapRef.current
            if (map===null){
                return
            }
            const bringPolylinesToFront = () => {
                map.eachLayer((layer) => {
                    if (layer instanceof L.Polyline) {
                        if (layer._latlngs.length > 2 && layer.options.weight === 7){
                        layer.bringToFront();
                        }
                        
                    }
                });
            };
    
            // Call this function initially and whenever routedata changes
            bringPolylinesToFront();
    
            // Listen for the map's moveend event to bring polylines to the front
            
    }, [routedata]);  
        
    //Used to track if user hovers over the edit button
    const handleEditMouseOver = () => {
        setEditHover(true);
          };
          
    const handleEditMouseOut = () => {
        setEditHover(false);
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
            style={{ flex: 1, width: '70%', height: "95%", marginTop: "-40px", zIndex: 0,}}
            whenCreated={(map) => { mapRef.current = map; }}
            ref={mapRef}
        >   
            <div className="edit-pane">
                <button
                    hidden={editing}
                    onClick={enableEditMode}
                    onMouseOver={handleEditMouseOver}
                    onMouseOut={handleEditMouseOut}
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
            <VectorTileLayer
                key={tileLayer}
                styleUrl={roadStyle}
            />
            {routedata.slice().reverse().map((route, index) => (

            <Polyline key={index} positions={route.route} color={route.color} pathOptions={{
            color: route.color, 
            zIndex: route.color === '#661e87' ? 1000000000 : 100000000,
            weight: 7,
          }}
          eventHandlers={{
            add: (e) => {
                    e.target.bringToFront();
            },
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
                     const { color, opacity } = getColorAndOpacity(polygon.properties.type, polygon.properties.effectValue);
                    if (polygon.properties.IsLine === 1) {
                    return (
                       

                        <Polyline
                            key={polygon.properties.id}
                            id={polygon.properties.id}
                            name={polygon.properties.name}
                            type={polygon.properties.type}
                            effectValue={polygon.properties.effectValue}
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
                            pathOptions={{
                                zIndex: 10000000
                            }}
                            originalColor={color}
                            originalOpacity={opacity} // Store original color for mouseout event
                        >
                            <Tooltip>{`${polygon.properties.name} | ${polygon.properties.type}`}</Tooltip>
                            
                        </Polyline>
                    )
                    } else {
                        return (
                        <Polygon
                            key={polygon.properties.id}
                            id={polygon.properties.id}
                            name={polygon.properties.name}
                            type={polygon.properties.type}
                            effectValue={polygon.properties.effectValue}
                            positions={polygon.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                            color={color}
                            fillOpacity={0.5}
                            eventHandlers={{
                                mouseover: handleMouseOver,
                                mouseout: handleMouseOut,
                            }}
                            originalColor={color}
                            originalOpacity={opacity}// Store original color for mouseout event
                        >
                            <Tooltip>{`${polygon.properties.name} | ${polygon.properties.type}`}</Tooltip>
                            
                        </Polygon>
                        
                    
                    )};
                mountingHelper=1;
                }))}

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
                        marker: false 
                        //old code used before markers were placed by clicking on map
                        //markerCount < 2 ? {
                        //    icon: placehold_icon
                        //} : false // Allow drawing markers only if there are less than 2 markers
                    }}
                />
            </FeatureGroup>}
        <ClickHandler onClick={handleClick} />
        </MapContainer>
        </ReactLeafletEditable>
    );
}

export default Map_Displayer;