import React from 'react';
import './App.css';
import { AppContextProvider } from './components/AppContext';
import Header from './components/Header/Header';
import SideBar from './components/SideBar/ListSideBar';
import MapDisplayer from './components/Map/MapDisplayer';
import RoutingForm from './components/Map/RouteField';
import TimedAlert from './components/TimedAlert';
import Modals from './components/Modals/Modals';

const App = () => {
    return (
        <AppContextProvider>
            <body className="app-layout">
                <header className="app-header">
                    <Header />
                </header>

                <TimedAlert />

                <main className="main">
                    <MapDisplayer />
                    <RoutingForm />
                </main>

                <aside>
                    <SideBar />
                </aside>

                <Modals />
            </body>
        </AppContextProvider>
    );
};

export default App;
