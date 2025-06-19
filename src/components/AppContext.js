import React, { createContext, useReducer, useContext } from 'react';

// =================================================================== //
// This file contains the context providers for different UI-elements, //
// like opening sidebars / modals, or toggling map modes.              //
//                                                                     //
// For logic related context, like storing profiles etc. use the Redux //
// store instead. (src/reducers/store.js)                                   //
// =================================================================== //

const AppContext = createContext();

const initialState = {
    sidebarType: null, // 'list' | 'add' | 'temproad' | 'guide' | null
    modalType: null, // 'profile' | 'disconnection' | null
    editMode: false,
    nodeSelectionMode: {
        active: false,
        selecting: null, // 'start' | 'end' | null
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
        case 'SET_NODE_SELECTION_MODE':
            return { ...state, visibleNodes: action.payload };
        default:
            return state;
    }
};

const AppContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppContextReducer, initialState);

    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

const { state, dispatch } = useContext(AppContext);

const getSidebarType = () => state.sidebarType;

const setSidebarType = (type) => {
    // 'list' | 'add' | 'temproad' | 'guide' | null
    dispatch({
        type: 'SET_SIDEBAR_TYPE',
        payload: type,
    });
};

const getModalType = () => state.modalType;

const setModalType = (type) => {
    // 'profile' | 'disconnection' | null
    dispatch({
        type: 'SET_MODAL_TYPE',
        payload: type,
    });
};

const getEditMode = () => state.editMode;

const setEditMode = (mode) => {
    // true | false
    dispatch({
        type: 'SET_EDIT_MODE',
        payload: mode,
    });
};

const getNodeSelectionMode = () => state.nodeSelectionMode;

const setNodeSelectionMode = (mode) => {
    // { active: true | false, selecting: 'start' | 'end' | null }
    dispatch({
        type: 'SET_NODE_SELECTION_MODE',
        payload: mode,
    });
};

export {
    getSidebarType,
    setSidebarType,
    getModalType,
    setModalType,
    getEditMode,
    setEditMode,
    getNodeSelectionMode,
    setNodeSelectionMode,
};

export default AppContextProvider;
