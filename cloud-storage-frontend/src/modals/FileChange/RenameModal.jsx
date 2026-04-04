import React, {useEffect, useState} from "react";
import {Box, Button, Modal, Slide, Typography} from "@mui/material";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ValidatedFileName from "../../components/InputElements/TextField/ValidatedFileName.jsx";
import {extractSimpleName, getCurrentDateTime} from "../../services/util/Utils.js";
import {useStorageOperations} from "../../context/Files/FileOperationsProvider.jsx";

export default function RenameModal({
                                        open,
                                        onClose,
                                        selectedIds,
                                        clearSelectionMode,
                                        isConflict = false,
                                        resolveConflict = null,
                                    }) {

    const {renameObject} = useStorageOperations();

    const [filename, setfilename] = useState('');
    const [filenameError, setFilenameError] = useState('');

    const isFolder = selectedIds.length === 1 && selectedIds[0].endsWith("/");

    const getFilename = () => {
        if (selectedIds.length === 1) {
            let name = extractSimpleName(selectedIds[0]);
            return isFolder ? name.slice(0, -1) : name;
        }
        return "";
    }

    const getNotConflictedFilename = () => {
        if (selectedIds.length === 1) {
            let name = extractSimpleName(selectedIds[0]);
            const unique = getCurrentDateTime().toString();
            return unique + ' - ' + (isFolder ? name.slice(0, -1) : name);
        }
        return "";
    }

    useEffect(() => {
        if (isConflict) {
            setTimeout(() => setfilename(getNotConflictedFilename()), 300)

        } else {
            setfilename(getFilename)
        }
    }, [open, selectedIds]);


    const handleSave = () => {

        if (isConflict) {
            resolveConflict(filename.trim() + (isFolder ? "/" : ""));
        } else {
            onClose();

            const sourcePath = selectedIds[0];
            const lastIndex = sourcePath.lastIndexOf(extractSimpleName(sourcePath));
            const targetPath = sourcePath.substring(0, lastIndex) + filename.trim() + (isFolder ? "/" : "");

            renameObject(sourcePath, targetPath);
            clearSelectionMode();
        }
    };


    return (
        <Modal open={open} onClose={onClose}>
            <Slide in={open} direction={'down'} style={{transform: "translate(-50%, 0%)", marginTop: "70px"}}>
                <Card variant="outlined"
                      sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          width: {sm: '400px', xs: '100%'},
                          maxWidth: {sm: '400px', xs: '90%'},
                          padding: 2,
                          gap: 2,
                          margin: 'auto',
                          backgroundColor: "modal",
                          backdropFilter: 'blur(6px)',
                          WebkitBackdropFilter: 'blur(6px)',
                          boxShadow: 5,
                          borderRadius: 2,
                          position: "relative",
                      }}
                >
                    <IconButton
                        aria-label="close"
                        size="small"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            width: '25px',
                            height: '25px',
                        }}
                    >
                        <CloseIcon sx={{fontSize: '25px'}}/>
                    </IconButton>

                    <Typography variant="h5" textAlign="center" sx={{width: '100%', mb: -1}}>
                        {!isConflict ? "Переименовать" : "Конфликт в названии"}
                    </Typography>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1,}}>

                        {isConflict &&
                            <Typography textAlign="center"
                                        sx={{width: '100%', fontSize: '15px', mb: 0, color: 'error.main'}}>
                                Выберите другое имя - такое уже используется в данной папке
                            </Typography>
                        }
                        <ValidatedFileName
                            filename={filename}
                            filenameError={filenameError}
                            setFilename={setfilename}
                            setFilenameError={setFilenameError}
                            label={isFolder ? "Название папки" : "Название файла"}
                        />

                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button size="small" variant="outlined" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleSave}
                                disabled={(filenameError || filename.length === 0 || getFilename() === filename.trim())}
                            >
                                Save
                            </Button>
                        </Box>

                    </Box>
                </Card>
            </Slide>
        </Modal>
    );

};