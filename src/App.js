import React from 'react';
import './App.css';
import { AppContextProvider } from './components/AppContext';
import Header from './components/Header/Header';
import SideBar from './components/SideBar/ListSideBar';
import Map_displayer from './components/Map/Map_Displayer';
import Routing_form from "./components/Map/RouteField";
import TimedAlert from "./components/TimedAlert";
import { MapContextProvider } from './components/Map/MapContext';
import { ProfileContext } from './components/Map/ProfileContext';
import { AppProviers } from './components/Map/CoordinatesContext';

const App = () => {
  return (
    <AppContextProvider>
      <AppProviers>
        <ProfileContext>
          <MapContextProvider>
            <body className="app-layout">
              <header className="app-header">
                <Header />
              </header>
            
              <TimedAlert />

              <main className="main">
                <Map_displayer />
                <Routing_form />
              </main>

              <aside>
                <SideBar />
              </aside>

              <Modals />
            </body>
          </MapContextProvider>
        </ProfileContext>
      </AppProviers>
    </AppContextProvider>
  );
}

export default App;
