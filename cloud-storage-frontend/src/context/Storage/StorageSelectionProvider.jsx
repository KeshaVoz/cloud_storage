import React, {createContext, useContext, useState} from "react";


const CloudStorageContext = createContext();

export const useStorageSelection = () => useContext(CloudStorageContext);


export const StorageSelectionProvider = ({children}) => {
    const [isSelectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [isCutMode, setCutMode] = useState(false);

    const [bufferIds, setBufferIds] = useState([]);



    const startCutting = () => {
        setBufferIds(selectedIds);
        setCutMode(true);

        setSelectedIds([]);
        setSelectionMode(false);
    }

    const endCutting = () => {
        setBufferIds([]);
        setCutMode(false);
    }

    return (<CloudStorageContext.Provider
        value={{
            isSelectionMode,
            setSelectionMode,
            selectedIds,
            setSelectedIds,

            bufferIds,

            isCutMode,
            startCutting,
            endCutting
        }}>
        {children}
    </CloudStorageContext.Provider>);
}