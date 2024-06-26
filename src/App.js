import React, { useEffect, useState} from "react";

import SideBar from "./components/SideBar";
import Header from "./components/Header";
import './App.css';
import CopeSideBar from "./components/CopeSideBar";
import Map_displayer from "./components/Map_Displayer";
import { AppProviders } from "./components/CoordinatesContext";
import Routing_form from "./components/RouteField";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useDispatch } from "react-redux";
import { fetchPolygons } from "./features/polygons/polygonsSlice";
import TimedAlert from "./components/TimedAlert";
import RouteList from "./components/RouteInfo";

function App() {
  const dispatch = useDispatch()
  const [sidebarOpenP, setSidebarOpenP] = useState(false);
  const [sidebarOpenA, setSidebarOpenA] = useState(false);
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    dispatch(fetchPolygons())
  }, [dispatch])
  //Toggle sidebar for viewing all added polygon
  const toggleSidebarp = () => {
    if (sidebarOpenA) {
      setSidebarOpenA(false);
    }
    setSidebarOpenP(!sidebarOpenP);
  };

  //Toggle sidebar for adding a polygon with input fields
  const toggleSidebara = () => {
    if (sidebarOpenP) {
      setSidebarOpenP(false);
    }
    setSidebarOpenA(!sidebarOpenA);
  };

  /*
  General functionalities:
  TimedAlert: Displays a timed alert message. uses a redux for adding / deleting timed alerts in other components as needed
  Header: Contains the header of the application. Contains the menu icons for the sidebar
  SideBar: Contains the sidebar for viewing all added polygons
  CopeSideBar: Contains the sidebar for adding a polygon with input fields
  Map_displayer: Contains the map functionalities. Uses react-leaflet library as a base. The largest component in the application. 
  Routing_form: Contains the form for adding a route with text inputs. Map functionalities make this a little useless, but could be updated to use street names instead of coordinates
  Routelist: Contains the info of ofund routes, such as their duration and distance. Could be updated to include driving instructions extracted from the osrm routeinfo bearing property
   
  */
  return (
    <div>
      <AppProviders>
      <div className="App" style={{overflow: "clip", overflowClipMargin: "10px"}}>
      
        <div style={{zIndex: "10", marginBottom: "40px"}}>
          <TimedAlert />
          <Header onClickP={toggleSidebarp} onClickA={toggleSidebara} className="App-header"  />
          
          <SideBar isOpen={sidebarOpenP} toggleSidebar={setSidebarOpenP} editMode={editMode} setEditMode={setEditMode}/>
          <CopeSideBar isOpen={sidebarOpenA} toggleSidebar={setSidebarOpenA} />
        </div>
        
      </div>
      <div className="box" style={{zIndex: "0"}}>
        <Map_displayer editMode={editMode} setEditMode={setEditMode} setSidebar={toggleSidebarp} isOpen={sidebarOpenP}/>
        
      </div>
      <div >
      <Routing_form/>
      <RouteList/>
      </div>
      </AppProviders>
    </div>
    
  );
}

export default App;
