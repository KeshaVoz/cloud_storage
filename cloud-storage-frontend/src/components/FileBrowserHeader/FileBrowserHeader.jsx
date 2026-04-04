import {Box, Button, Card, CircularProgress, Container, Divider, IconButton} from "@mui/material";
import Typography from "@mui/material/Typography";
import {CustomBread} from "./Breadcrumbs/CustomBread.jsx";
import {useStorageNavigation} from "../../context/Storage/StorageNavigationProvider.jsx";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, {useEffect, useRef, useState} from "react";
import {FileMenu} from "./FileMenu/FileMenu.jsx";
import CloseIcon from "@mui/icons-material/Close";
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {useStorageSelection} from "../../context/Storage/StorageSelectionProvider.jsx";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import {useStorageOperations} from "../../context/Files/FileOperationsProvider.jsx";
import AddIcon from '@mui/icons-material/Add';
import {FolderMenu} from "./FolderMenu/FolderMenu.jsx";

export const FileBrowserHeader = () => {

    const {
        isRootFolder,
        goToPrevFolder,
        currentFolder,
        folderContentLoading,
    } = useStorageNavigation();

    const {

        isCutMode,
        bufferIds,

        endCutting
    } = useStorageSelection();


    const {pasteObjects} = useStorageOperations();




    function handleBack() {
        goToPrevFolder();
    }

    const [anchorEl, setAnchorEl] = useState(null);
    const handleCloseMenu = () => {
        setAnchorEl(null);
    }
    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const [anchorElFolder, setAnchorElFolder] = useState(null);
    const handleCloseFolderMenu = () => {
        setAnchorElFolder(null);
    }
    const handleOpenFolderMenu = (event) => {
        setAnchorElFolder(event.currentTarget);
    }

    const scrollBoxRef = useRef(null);

    useEffect(() => {
        if (scrollBoxRef.current) {
            scrollBoxRef.current.scrollLeft = 500;
        }
    }, [currentFolder, folderContentLoading]);


//context


    return (
        <Container disableGutters
                   sx={{
                       mt: 8,
                       width: '100%',
                       position: 'fixed',
                       transform: 'translateX(-50%)',
                       left: '50%',
                       zIndex: 2,
                   }}
        >


            <Box sx={{p: 1}}>
                <Card elevation={0}
                      sx={{
                          backgroundColor: "header",
                          width: "100%",
                          boxShadow: 4,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          height: '110px'

                      }}
                >
                    <Box
                        ref={scrollBoxRef}
                        sx={{
                            pl: 1,
                            pr: 1,
                            maxHeight: '51px',
                            height: '51px',
                            display: "flex",
                            overflowX: "auto",
                            maxWidth: "100%",
                            "&::-webkit-scrollbar": {height: "3px"},
                            "&::-webkit-scrollbar-thumb": {backgroundColor: "#888", borderRadius: "3px"},
                            scrollbarWidth: "thin",
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            },
                        }}
                    >
                        {folderContentLoading ?
                            <CircularProgress sx={{mt: 1, ml: 1}} size={30}/> :
                            <CustomBread/>}
                    </Box>

                    <Divider sx={{m: 0}}/>

                    <Box
                        sx={{
                            p: 1,
                            display: "flex",
                            overflowX: "auto",
                            maxWidth: "100%",
                        }}
                    >


                        {!isRootFolder &&
                            <Button onClick={handleBack} variant='contained' sx={{
                                minHeight: '38px',
                                minWidth: '38px',
                                p: 0,
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%'
                            }}>
                                <ArrowBackIcon/>
                            </Button>
                        }

                        { !isCutMode ?
                            <Box sx={{
                                position: 'absolute',
                                width: "50%",

                                transform: 'translateX(-50%)',
                                left: '50%',
                                bottom: 13,
                            }}>
                                <Typography variant='h5' sx={{
                                    width: '100%',
                                    userSelect: 'none',
                                    fontSize: '20px',
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {!folderContentLoading && (currentFolder ? currentFolder.slice(0, -1) : 'Корневой каталог')}

                                </Typography>
                            </Box>
                            :

                            <Box sx={{
                                position: 'absolute',
                                width: "70%",
                                maxWidth: '500px',
                                height: '48px',
                                border: '2px solid',
                                borderRadius: '24px',
                                borderColor: 'info.dark',
                                background: 'linear-gradient(90deg, rgba(16,113,175,1)   0%,  rgba(28,73,163,1) 100%)',
                                transform: "translateX(-50%)",
                                left: '50%',
                                bottom: 4,
                            }}
                            >
                                <IconButton
                                    onClick={() => {
                                        endCutting();
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 4.5,
                                        left: 7,
                                        width: '35px',
                                        height: '35px',
                                        backgroundColor: 'error.main',
                                        '&:hover': {
                                            backgroundColor: 'error.dark',

                                        }
                                    }}
                                >
                                    <CloseIcon sx={{fontSize: '28px'}}/>
                                </IconButton>


                                <Typography variant='h6' sx={{
                                    width: '100%',
                                    userSelect: 'none',
                                    textAlign: 'center',
                                    color: 'white',
                                    pt: 0.8
                                }}>

                                    {isCutMode &&
                                        <ContentCutIcon sx={{fontSize: '20px', pt: '1px', mr: 0.5, mb: -0.3}}/>}

                                    Буфер: {bufferIds.length} <InsertDriveFileIcon
                                    sx={{fontSize: '20px', pt: '1px', ml: -0.3, mb: -0.3}}/>

                                </Typography>

                                <IconButton

                                    onClick={pasteObjects}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 4.5,
                                        right: 7,
                                        width: '35px',
                                        height: '35px',
                                        backgroundColor: 'success.main',
                                        '&:hover': {
                                            backgroundColor: 'success.dark',

                                        }
                                    }}
                                >
                                    <ContentPasteGoIcon sx={{fontSize: '28px'}}/>
                                </IconButton>
                            </Box>
                        }
                        <IconButton onClick={handleOpenFolderMenu} variant='contained' sx={{ml: 'auto'}}>
                            <AddIcon/>
                        </IconButton>

                        { !isCutMode &&

                            <IconButton onClick={handleOpenMenu} variant='contained' sx={{ml: '0'}}>
                                <MoreVertIcon/>
                            </IconButton>
                        }


                    </Box>
                </Card>
            </Box>
            <FileMenu anchorEl={anchorEl} handleCloseMenu={handleCloseMenu}/>
            <FolderMenu anchorEl={anchorElFolder} handleCloseMenu={handleCloseFolderMenu}/>

        </Container>
    )
}