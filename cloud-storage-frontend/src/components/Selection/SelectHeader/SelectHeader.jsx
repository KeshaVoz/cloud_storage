import {Box, Container, Divider, List, ListItemIcon, ListItemText, MenuItem, Popper, Toolbar} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import Typography from "@mui/material/Typography";
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import {useStorageSelection} from "../../../context/Storage/StorageSelectionProvider.jsx";
import {useStorageOperations} from "../../../context/Files/FileOperationsProvider.jsx";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import RenameModal from "../../../modals/FileChange/RenameModal.jsx";
import {ContentCut, ContentPaste} from "@mui/icons-material";
import {isMobile} from "react-device-detect";
import {useStorageNavigation} from "../../../context/Storage/StorageNavigationProvider.jsx";


export const SelectHeader = () => {
    const {deleteObject, downloadObjects, pasteObjects} = useStorageOperations();

    const allowContext = window.APP_CONFIG.isFileContextMenuAllowed;

    const isMob = isMobile;

    const allowToCut = window.APP_CONFIG.isCutPasteAllowed;

    const {
        isSelectionMode,
        setSelectionMode,
        selectedIds,
        setSelectedIds,
        startCutting,
        isCutMode
    } = useStorageSelection();

    const {isSearchMode, setSearchedContent, loadFolder} = useStorageNavigation();

    const clearSelectionMode = () => {
        setSelectionMode(false);
        setSelectedIds([]);
    }

    function handleDelete() {
        deleteObject(selectedIds);
        clearSelectionMode();
    }

    async function handleDownload() {
        downloadObjects(selectedIds[0]);
        clearSelectionMode()
        setAnchorEl2(null);
    }

    const [modalRenameOpen, setModalRenameOpen] = useState(false);

    function handleRenameClick() {
        setModalRenameOpen(true);
        setAnchorEl2(null);
    }

    const handleCloseRenameModal = () => {
        setModalRenameOpen(false);
    };


    const [anchorEl2, setAnchorEl2] = useState(null);

    const handleDeleteContext = () => {
        deleteObject(selectedIds);
        setSelectionMode(false);
        setSelectedIds([]);
        setAnchorEl2(null);
    }

    const handleCut = () => {
        startCutting();
        setAnchorEl2(null);
    }

    const handlePaste = () => {
        pasteObjects();
        setAnchorEl2(null);
    }


    const createAnchorElement = useCallback((container, x, y) => {
        const anchorElement = document.createElement('div');
        anchorElement.style.position = 'absolute';
        anchorElement.style.left = `${x}px`;
        anchorElement.style.top = `${y}px`;
        container.appendChild(anchorElement);
        return anchorElement;
    }, []);

    const handleClose = useCallback((event) => {
        const elementsUnderCursor = document.elementsFromPoint(event.clientX, event.clientY);
        const contextPopper = elementsUnderCursor.find(elem => elem.classList.contains('MuiPopper-root'));
        if (contextPopper) return;

        const tileUnderCursor = elementsUnderCursor.find(elem => elem.classList.contains('selectable'));
        const shouldStartDrag = tileUnderCursor && selectedIds.includes(tileUnderCursor.dataset.id)

        if (!shouldStartDrag && (isSelectionMode || selectedIds.length > 0)) {
            setSelectionMode(false);
            setSelectedIds([]);
        }
        setAnchorEl2(null);
    }, []);

    // Обработчик контекстного меню
    const handleContextMenu = useCallback((event) => {

        const elementsUnderCursor = document.elementsFromPoint(event.clientX, event.clientY);
        const container = document.querySelector(".MuiContainer-root .elements");
        const cont = elementsUnderCursor.find(elem => elem.classList.contains('MuiContainer-root'));

        if (!cont || event.clientY < 184) {
            return;
        }
        event.preventDefault();

        const selectableItem = elementsUnderCursor.find(elem => elem.classList.contains('selectable'));

        if (selectedIds.length === 1
            && selectableItem
            && selectableItem.dataset.id !== selectedIds[0]) {
            setSelectedIds([selectableItem.dataset.id]);
            setSelectionMode(true);
        }

        if (selectableItem && selectedIds.length === 0 && !isCutMode) {
            setSelectedIds([selectableItem.dataset.id]);
            setSelectionMode(true);

        }

        const containerRect = container.getBoundingClientRect();
        const relativeX = event.clientX + 125;
        const relativeY = event.clientY - containerRect.top + 190;

        const anchorElement = createAnchorElement(container, relativeX, relativeY);
        setAnchorEl2(anchorElement);
    }, [selectedIds, isCutMode, createAnchorElement]);

    useEffect(() => {
        if (!isMob && allowContext) {
            //todo test experemental mousedown
            document.addEventListener('contextmenu', handleContextMenu, true);
            document.addEventListener('mousedown', handleClose, true);

            return () => {
                document.removeEventListener('contextmenu', handleContextMenu, true);
                document.removeEventListener('mousedown', handleClose, true);
            };
        }
    }, [handleContextMenu, handleClose]);


    return (
        <Container
            sx={{
                zIndex: 2000,
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: isSelectionMode ? '-6px' : '-70px',
                transition: 'top 0.2s ease-in-out',
                userSelect: 'none'
            }}
            disableGutters>
            <Toolbar
                sx={{
                    height: "70px",
                    border: '1px solid',
                    background: 'linear-gradient(90deg, rgba(28,50,163,1) 0%, rgba(16,113,195,1) 100%)', // Градиент для прогресса

                    borderRadius: 2,
                    borderColor: 'info.dark',
                    ml: '8px',
                    mr: '8px',
                    userSelect: 'none'

                }}
            >


                <IconButton
                    sx={{
                        position: 'absolute',
                        bottom: 14,
                        left: 7,
                        width: '35px',
                        height: '35px',
                        color: 'white',
                        userSelect: 'none'

                    }}
                >

                    <CheckBoxOutlinedIcon sx={{fontSize: '20px'}}/>

                </IconButton>

                <Typography
                    sx={{
                        width: '49%',
                        pl: '45px',
                        textAlign: 'left',
                        position: 'absolute',
                        bottom: 17,
                        pointerEvents: 'none',
                        left: 0,
                        fontSize: '18px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'white',
                        userSelect: 'none',
                        '&:hover': {
                            cursor: 'default',
                        },
                    }}
                >

                    {selectedIds.length === 1 ? ('1 file') : (selectedIds.length + ' files')}

                </Typography>

                <Box sx={{display: 'flex', ml: 'auto'}}>
                    <IconButton
                        onClick={handleDownload}
                        sx={{
                            display: selectedIds.length === 1 ? 'flex' : 'none',

                            width: '35px',
                            height: '35px',
                            color: 'white',
                            userSelect: 'none'

                        }}
                    >
                        <DownloadIcon sx={{fontSize: '20px'}}/>
                    </IconButton>

                    <IconButton
                        onClick={handleRenameClick}
                        sx={{
                            display: selectedIds.length === 1 ? 'flex' : 'none',

                            width: '35px',
                            height: '35px',
                            color: 'white',
                            userSelect: 'none'

                        }}
                    >
                        <DriveFileRenameOutlineIcon sx={{fontSize: '20px'}}/>
                    </IconButton>

                    {!isSearchMode &&
                        <IconButton
                            onClick={handleDelete}
                            sx={{

                                width: '35px',
                                height: '35px',
                                color: 'white',
                                userSelect: 'none'

                            }}
                        >
                            <DeleteIcon sx={{fontSize: '20px'}}/>
                        </IconButton>

                    }
                    {allowToCut &&
                        <IconButton
                            onClick={startCutting}
                            sx={{

                                width: '35px',
                                height: '35px',
                                color: 'white',
                                userSelect: 'none'

                            }}
                        >
                            <ContentCutIcon sx={{fontSize: '20px'}}/>
                        </IconButton>
                    }


                    <IconButton
                        onClick={clearSelectionMode}
                        sx={{

                            width: '30px',
                            height: '30px',
                            color: 'white',
                            userSelect: 'none',

                            backgroundColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.dark',
                            }
                        }}
                    >
                        <CloseIcon sx={{fontSize: '25px'}}/>
                    </IconButton>
                </Box>


            </Toolbar>
            <RenameModal open={modalRenameOpen}
                         onClose={handleCloseRenameModal}
                         selectedIds={selectedIds}
                         clearSelectionMode={clearSelectionMode}/>

            <Popper
                open={anchorEl2 !== null}
                // onClose={handleClose}
                anchorEl={anchorEl2}
                // placement='top-start'
                // transition
                sx={{
                    backgroundColor: 'background.paper',
                    width: 250,
                    maxWidth: '100%',
                    zIndex: 200,
                    // backgroundColor: 'background.paper'
                }}

            >
                <List
                    sx={{
                        width: 250,
                        // border: '1px solid',
                        borderRadius: 2,
                        boxShadow: 5,
                        backgroundColor: 'paper',
                        maxWidth: '100%'
                    }}
                >
                    {allowToCut &&
                        <>
                            <MenuItem
                                disabled={selectedIds.length === 0}
                                onClick={handleCut}
                            >
                                <ListItemIcon>
                                    <ContentCut fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText>Вырезать</ListItemText>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    Ctrl+X
                                </Typography>
                            </MenuItem>

                            <MenuItem
                                disabled={!isCutMode || isSearchMode}
                                onClick={handlePaste}
                            >
                                <ListItemIcon>
                                    <ContentPaste fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText>Вставить</ListItemText>
                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                    Ctrl+V
                                </Typography>
                            </MenuItem>

                            <Divider/>
                        </>
                    }
                    {!isSearchMode &&
                        <MenuItem
                            disabled={selectedIds.length === 0}
                            onClick={handleDeleteContext}
                        >
                            <ListItemIcon>
                                <DeleteIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Удалить</ListItemText>
                            <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                Del
                            </Typography>
                        </MenuItem>
                    }

                    {!isSearchMode &&
                        <MenuItem
                            disabled={selectedIds.length !== 1}

                            onClick={handleRenameClick}
                        >
                            <ListItemIcon>
                                <DriveFileRenameOutlineIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Переименовать</ListItemText>

                        </MenuItem>
                    }
                    <Divider/>
                    <MenuItem
                        disabled={selectedIds.length !== 1}

                        onClick={handleDownload}
                    >
                        <ListItemIcon>
                            <DownloadIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>Скачать</ListItemText>

                    </MenuItem>


                </List>
            </Popper>

        </Container>


    );
};

