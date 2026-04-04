import {Tooltip, Zoom} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";


export const ObjectName = ({object}) => {


    return (
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
                    width: '100%',
                    textAlign: 'center',
                    position: 'absolute',
                    bottom: 0,
                    pl: '3px',
                    pr: '3px',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    color: 'text.secondary',
                    fontSize: '15px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    '&:hover': {
                        cursor: 'default',
                    },
                }}
            >
                {object.folder ? object.name.slice(0, -1) : object.name}
            </Typography>
        </Tooltip>
    )
}