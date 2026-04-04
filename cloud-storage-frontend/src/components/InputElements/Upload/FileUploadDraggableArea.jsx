import * as React from "react";
import {useCallback, useEffect, useRef} from "react";
import {Box} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useStorageOperations} from "../../../context/Files/FileOperationsProvider.jsx";
import {useNotification} from "../../../context/Notification/NotificationProvider.jsx";

export const FileUploadDraggableArea = ({dragRef, isDragging, setIsDragging}) => {

    const {uploadObjects} = useStorageOperations();

    const {showWarn} = useNotification();

    const dragCounter = useRef(0);
    // Обработчик перетаскивания
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        dragCounter.current = 0;

        const droppedItems = Array.from(e.dataTransfer.items);
        const newFiles = [];

        const processItem = async (item) => {
            const entry = item.webkitGetAsEntry();

            if (entry) {
                if (entry.isFile) {
                    const file = await new Promise((resolve) => entry.file(resolve));
                    newFiles.push({
                        file,
                        path: file.name,
                    });
                } else if (entry.isDirectory) {
                    await readDirectory(entry, entry.name);
                }
            }
        };

        const readDirectory = async (dirEntry, basePath) => {
            const reader = dirEntry.createReader();
            const entries = await new Promise((resolve) => reader.readEntries(resolve));

            for (const entry of entries) {
                if (entry.isFile) {
                    const file = await new Promise((resolve) => entry.file(resolve));
                    newFiles.push({
                        file,
                        path: `${basePath}/${file.name}`,
                    });
                } else if (entry.isDirectory) {
                    await readDirectory(entry, `${basePath}/${entry.name}`);
                }
            }
        };

        Promise.all(droppedItems.map((item) => processItem(item)))
            .then(() => {
                uploadObjects(newFiles);
                if(newFiles.length === 0){
                    showWarn("Нельзя загружать пустые папки")
                }
            });
    }, []);


    // Добавляем обработчики событий на весь документ
    useEffect(() => {
        // dragRef.current.addEventListener('dragover', handleDragOver);
        const node = dragRef.current;
        node.addEventListener('dragenter', handleDragEnter);
        node.addEventListener('dragover', handleDragOver);
        node.addEventListener('dragleave', handleDragLeave);
        node.addEventListener('drop', handleDrop);

    }, [handleDragOver, handleDragLeave, handleDrop]);

    return (
        <>
            {isDragging &&
                <Box
                    sx={{
                        zIndex: 50,
                        p: 2,
                        pt: 10,
                        top: 0,
                        position: 'fixed',
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        height: '100%',
                        width: '100%',

                    }}>

                    <Box
                        sx={{
                            color: 'text.secondary',
                            width: '100%',
                            height: '100%',
                            border: '10px dashed',
                            borderColor: 'text.secondary',
                            backdropFilter: 'blur(5px)',
                            WebkitBackdropFilter: 'blur(5px)',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 2,
                        }}>


                        <Typography variant="h2"
                                    sx={{
                                        fontWeight: '400',
                                        position: 'absolute',
                                        textAlign: 'center',
                                        width: '100%',
                                        left: '50%',
                                        top: '250px',
                                        transform: 'translate(-50%, -50%)',
                                        textShadow: '5px 5px 5px rgba(0, 0, 0, 0.55)',
                                    }}
                        >
                            Отпустите, чтобы начать загрузку.
                        </Typography>

                        <Typography variant="h4"
                                    sx={{
                                        fontWeight: '400',
                                        position: 'absolute',
                                        textAlign: 'center',
                                        width: '100%',
                                        left: '50%',
                                        top: '350px',
                                        transform: 'translate(-50%, -50%)',
                                        textShadow: '5px 5px 5px rgba(0, 0, 0, 0.55)',

                                    }}
                        >
                            Максимальный размер для загрузки - 2Гб
                        </Typography>
                    </Box>
                </Box>
            }
        </>
    );
};
