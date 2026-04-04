import {Tooltip, Zoom} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import bytes from "bytes";
import {formatDate} from "../../../services/util/Utils.js";


export const ObjectListName = ({object}) => {


    return (
        <>
            <Tooltip
                title={object.folder ? object.name.slice(0, -1) : object.name}
                placement="bottom"
                arrow
                enterDelay={700}

                slotProps={{
                    popper: {
                        modifiers: [
                            {
                                name: 'offset',
                                options: {
                                    offset: [0, -5],
                                },
                            },
                        ],
                    },
                }}
                slots={{
                    transition: Zoom,
                }}

            >
                <Typography
                    sx={{
                        width: '38%',
                        textAlign: 'left',
                        position: 'absolute',
                        bottom: 12,
                        fontSize: '16px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        pointerEvents: 'none',

                        userSelect: 'none',
                        '&:hover': {
                            cursor: 'default',
                        },
                    }}
                >
                    {object.folder ? object.name.slice(0, -1) : object.name}
                </Typography>
            </Tooltip>


            <Typography
                sx={{
                    width: '20%',
                    textAlign: 'left',
                    position: 'absolute',
                    bottom: 14,
                    left: '50%',
                    fontSize: '12px',
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',

                    userSelect: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '&:hover': {
                        cursor: 'default',
                    },
                }}
            >
                {!object.folder && bytes(object.size, {decimalPlaces: 0})}
            </Typography>
            {!object.folder &&
                <Typography
                    sx={{
                        width: '40%',
                        textAlign: 'left',
                        position: 'absolute',
                        bottom: 14,
                        left: '63%',
                        fontSize: '12px',
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        pointerEvents: 'none',

                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        '&:hover': {
                            cursor: 'default',
                        },
                    }}
                >
                    {object.lastModified && formatDate(object.lastModified)}
                </Typography>

            }

        </>
    )
}