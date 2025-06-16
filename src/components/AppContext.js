import React, { createContext, useReducer } from 'react';

// =================================================================== //
// This file contains the context providers for different UI-elements, //
// like opening sidebars / modals, or toggling map components.         //
//                                                                     //
// For logic related context, like storing profiles etc. use the Redux //
// store instead. (src/app/store.js)                                   //
// =================================================================== //

const AppContext = createContext();

const initialState = {
    sidebarType: null, // 'list' | 'add' | 'temproad' | 'guide' | null
    modalType: null, // 'profile' | 'disconnection' | null
    editMode: false,
    visibleTempRoads: new Set(), // This should maybe moved to Redux store
    nodeSelectionMode: {
        active: false,
        selecting: null // 'start' or 'end'
    },
};

const AppContextReducer = (state, action) => {
    switch (action.type) {
        case 'SET_SIDEBAR_TYPE':
            return { ...state, sidebarType: action.payload };
        case 'SET_MODAL_TYPE':
            return { ...state, modalType: action.payload };
        case 'SET_EDIT_MODE':
            return { ...state, editMode: action.payload };
        default:
            return state;
        case 'SET_VISIBLE_TEMP_ROADS':
            return { ...state, visibleTempRoads: action.payload };
        case 'SET_NODE_SELECTION_MODE':
            return { ...state, visibleNodes: action.payload };
    }
}

const AppContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppContextReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppContextProvider };
