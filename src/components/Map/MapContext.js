import React, { createContext, useReducer, useRef } from 'react';

// This file contains the context providers for the visual side of the map

const MapContext = createContext();

const initialState = {
    nodeSelectionHandler: null, // handler function
    disconnectedRoadRef: useRef({show: null, clear: null, list: null}) // all handler functions
};

const MapContextReducer = (state, action) => {
    switch (action.type) {
        case 'SET_NODE_SELECTION_HANDLER':
            return { ...state, nodeSelectionHandler: action.payload };
        case 'SET_DISCONNECTED_ROAD_REF_CURRENT':
            state.disconnectedRoadRef.current = action.payload;
            return state;
        default:
            return state;
    }
}

const MapContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(MapContextReducer, initialState);

    return (
        <MapContext.Provider value={{ state, dispatch }}>
            {children}
        </MapContext.Provider>
    );
};

export { MapContext, MapContextProvider };
