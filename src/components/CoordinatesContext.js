import React, { createContext, useState } from 'react';

// Coordinates Context
export const CoordinatesContext = createContext();

export const CoordinatesProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState([]);

  return (
    <CoordinatesContext.Provider value={{ coordinates, setCoordinates }}>
      {children}
    </CoordinatesContext.Provider>
  );
};

// Route Context
export const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const [route, setRoute] = useState([{},{}]);

  return (
    <RouteContext.Provider value={{ route, setRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

// Combined Providers
export const AppProviders = ({ children }) => {
  return (
    <CoordinatesProvider>
      <RouteProvider>
        {children}
      </RouteProvider>
    </CoordinatesProvider>
  );
};