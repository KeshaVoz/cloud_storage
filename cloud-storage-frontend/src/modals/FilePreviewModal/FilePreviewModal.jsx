import React from "react";
import {Box, Modal, Typography} from "@mui/material";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {extractSimpleName, formatDate} from "../../services/util/Utils.js";
import bytes from "bytes";

import {FileFormatIcon} from "../../assets/FileFormatIcon.jsx";

export default function FilePreviewModal({
                                             open,
                                             onClose,
                                             object
                                         }) {
    const dotIndex = object ? object.path.lastIndexOf(".") : 0;
    const format = object ? object.path.substring(dotIndex + 1) : 0;


    const getContentViewer = (format) => {
        return (
            <Box
            >
                <FileFormatIcon name={object.name} style={"list"}/>
            </Box>
        )
    }

    return (
        <Modal  open={open} onClose={onClose} sx={{position: 'fixed', top: 0}}>

                <Card variant="outlined"
                      sx={{
                          display: 'flex',

                          flexDirection: 'column',
                          width: '100%',
                          maxWidth: {md: '800px', xs: '90%'},
                          pl: 2,
                          pr: 2,
                          position: 'fixed',
                          transform: 'translate(-50%, -50%)',
                          left: '50%',
                          top: '50%',
                          height: '500px',

                          margin: 'auto',
                          backgroundColor: "modal",
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          boxShadow: 5,
                          borderRadius: 2,
                          // position: "relative",
                          zIndex: 200
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
                            zIndex: 200

                        }}
                    >
                        <CloseIcon sx={{fontSize: '25px'}}/>
                    </IconButton>

                    {object &&
                    <>

                    <Box sx={{
                        m: 1,
                        pr: 2,

                        // width: '100%',


                    }}>
                        <Typography
                            sx={{
                                width: '100%',
                                whiteSpace: 'nowrap',
                                userSelect: 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >{extractSimpleName(object.path)}</Typography>
                    </Box>

                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '500px',
                        // backgroundColor: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                    }}>
                        {open && object && getContentViewer(format)}

                    </Box>

                    <Box sx={{
                        width: '50&',
                        display: 'flex',
                        mt: 1,
                        mb: 1,
                        height: '40px',
                    }}>
                        <Typography
                            sx={{
                                width: '200px',
                                color: 'text.secondary',
                            }}
                        >Размер: {bytes(object.size)}</Typography>
                        <Typography
                            sx={{
                                width: '50%',
                                color: 'text.secondary',
                            }}
                        >{object.lastModified && "Изменен: " && formatDate(object.lastModified)}</Typography>

                    </Box>
                    </>
                    }
                </Card>

        </Modal>
    );

};