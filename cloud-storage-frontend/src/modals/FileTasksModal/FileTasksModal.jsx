import React, {useEffect, useState} from "react";
import {Box, Container} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {Task} from "./Task.jsx";
import {useStorageOperations} from "../../context/Files/FileOperationsProvider.jsx";

export const FileTasksModal = () => {

    const {
        tasks,
        newTasksAdded,
        setNewTasksAdded,
        clearTasks,
        allTasksCompleted
    } = useStorageOperations();

    const [showModal, setShowModal] = useState(false);

    const handleArrowClick = () => {
        setShowModal(prev => !prev);
    }

    useEffect(() => {
        if (tasks.length === 0) {
            setShowModal(false);
        }
    }, [tasks])

    useEffect(() => {
        if (newTasksAdded) {
            setShowModal(true);
            setNewTasksAdded(false);
        }

    }, [newTasksAdded]);


    const initialPosition = tasks.length > 0 ? '50px' : '0px';

    const bottomPosition = showModal ? "390px" : initialPosition;


    return (<Container
        sx={{
            zIndex: 3000,
            position: 'fixed',
            left: '50%',
            bottom: bottomPosition,
            transform: 'translateX(-50%)', // top: isSelectionMode ? '-6px' : '-70px',
            // top: '-6px',
            transition: 'bottom 0.2s ease-in-out',
            backgroundColor: 'transparent',

        }}
        disableGutters>
        <Box
            sx={{
                position: 'absolute',
                right: 8,
                width: "96%",
                maxWidth: '450px',
                height: "400px",
                overflow: 'hidden',

                // border: '1px solid',
                // backdropFilter: 'blur(12px)',
                // WebkitBackdropFilter: 'blur(12px)',
                // boxShadow: 8,
                backgroundColor: "transparent",
                borderRadius: 2,
                borderColor: 'divider',

            }}
        >

            <Box
                sx={{
                    position: 'relative',
                    marginLeft: 'auto',
                    width: '80%',
                    borderTopLeftRadius: 10,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(90deg, rgba(28,50,163,1) 0%, rgba(16,113,195,1) 100%)', // Градиент для прогресса
                    height: '50px',
                }}
            >
                {allTasksCompleted() && <IconButton
                    onClick={clearTasks}
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 7,
                        width: '35px',
                        height: '35px',
                        color: 'rgb(230,230,230)',
                    }}
                >
                    <CloseIcon sx={{fontSize: '30px'}}/>
                </IconButton>}

                <IconButton
                    onClick={handleArrowClick}
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 40,
                        width: '35px',
                        height: '35px',
                        color: 'rgb(230,230,230)',
                    }}
                >
                    <KeyboardArrowDownIcon sx={{fontSize: '40px', transform: showModal ? 'none' : 'scaleY(-1)'}}/>
                </IconButton>

                <Typography
                    sx={{
                        textAlign: 'left',
                        position: 'absolute',
                        bottom: 8,
                        pointerEvents: 'none',
                        left: 10,
                        fontSize: '18px',
                        color: 'rgb(230,230,230)',
                        userSelect: 'none',
                        '&:hover': {
                            cursor: 'default',
                        },
                    }}
                >
                    Операции
                </Typography>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    backgroundColor: 'menu',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderTopLeftRadius: 10,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: 8,
                    p: 1, pb: 0, height: '340px', overflowY: 'auto',
                }}>
                {tasks.slice().reverse().map((task) => <Task task={task}/>)}
            </Box>


        </Box>
    </Container>);
};