import React, {createContext, useContext, useState} from "react";
import {useStorageSelection} from "./StorageSelectionProvider.jsx";


const CloudStorageContext = createContext();

export const useStorageView = () => useContext(CloudStorageContext);


export const StorageViewProvider = ({children}) => {
    const {setSelectedIds, setSelectionMode} = useStorageSelection();

    const [filesView, setFilesView] = useState(() => {
        const view = localStorage.getItem('filesView');
        return view ? view : 'regularTiles';
    });

    const toggleFilesView = (mode) => {
        setSelectionMode(false);
        setSelectedIds([]);

        setFilesView(() => {
            localStorage.setItem('filesView', mode);
            return mode;
        })
    };

    const turnRegularTiles = () => toggleFilesView('regularTiles');
    const turnLargeTiles = () => toggleFilesView('largeTiles');
    const turnList = () => toggleFilesView('list');


    const buildSortFunction = () => {

        if (sortParameter === 'name') {
            if (sortDirection === 'asc') {
                return (a, b) => a.name.localeCompare(b.name);
            } else {
                return (a, b) => b.name.localeCompare(a.name);

            }
        }
        if (sortParameter === 'size') {
            if (sortDirection === 'asc') {
                return (a, b) => a.size - b.size;
            } else {
                return (a, b) => b.size - a.size;

            }
        }
        if (sortParameter === 'date') {
            if (sortDirection === 'asc') {
                return (a, b) => new Date(a.lastModified) - new Date(b.lastModified);
            } else {
                return (a, b) => new Date(b.lastModified) - new Date(a.lastModified);
            }
        }
    }

    const [sortDirection, setSortDirection] = useState(
        () => {
            const dir = localStorage.getItem('sortDirection');
            return dir ? dir : 'asc';
        });

    const [sortParameter, setSortParameter] = useState(
        () => {
            const par = localStorage.getItem('sorting');
            return par ? par : 'name';
        });

    const sortFolder = (content) => {
        let folders = content.filter(item => item.folder);
        let files = content.filter(item => !item.folder);
        let sortedFiles = files.sort(buildSortFunction());
        return [...folders, ...sortedFiles];
    }

    const setNameSort = () => {
        setSortParameter('name');
        localStorage.setItem("sorting", "name");
    }

    const setSizeSort = () => {
        setSortParameter('size');
        localStorage.setItem("sorting", "size");
    }

    const setDateSort = () => {
        setSortParameter('date');
        localStorage.setItem("sorting", "date");
    }

    const setDesc = () => {
        setSortDirection("desc")
        localStorage.setItem("sortDirection", "desc");
    }

    const setAsc = () => {
        setSortDirection("asc")
        localStorage.setItem("sortDirection", "asc");
    }

    return (<CloudStorageContext.Provider
        value={{
            filesView,
            turnLargeTiles,
            turnRegularTiles,
            turnList,

            sortFolder,
            setNameSort,
            setSizeSort,
            setDateSort,
            setDesc,
            setAsc,
            sortParameter,
            sortDirection
        }}>
        {children}
    </CloudStorageContext.Provider>);
}