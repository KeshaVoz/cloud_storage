import {Box, Card} from "@mui/material";
import React from "react";
import {useStorageNavigation} from "../../../context/Storage/StorageNavigationProvider.jsx";
import {ObjectListName} from "../elements/ObjectListName.jsx";
import {useLongPress} from "../../Selection/hook/useLongPress.jsx";
import {isMobile} from "react-device-detect";
import CheckIcon from "@mui/icons-material/Check";
import {useStorageSelection} from "../../../context/Storage/StorageSelectionProvider.jsx";
import {FileFormatIcon} from "../../../assets/FileFormatIcon.jsx";
import ContentCutIcon from "@mui/icons-material/ContentCut";

const isMob = isMobile;


export default function StorageListObject({object, style, selectedIds, bufferIds, handlePreview}) {

    const {goToFolder} = useStorageNavigation();
    const {setSelectionMode, isSelectionMode, isCopyMode} = useStorageSelection();

    const onClick = isMob ? () => {
        if (object.folder && !isSelectionMode &&  !cutted) {
            goToFolder(object.name);
            return;
        }
        if (!isSelectionMode) {
            handlePreview(object);
        }
    } : () => {
    }

    const onDoubleClick = !isMob ? () => {
        if (object.folder &&  !cutted) {
            goToFolder(object.name);
            return;
        }
        handlePreview(object);
    } : null;

    const onLongPress = isMob ? () => {
        if (navigator.vibrate) {
            navigator.vibrate(70);
        }
        if (!isSelectionMode && !isCutMode && !isCopyMode) {
            setSelectionMode(true);
        }

    } : null;

    const longPressEvent = useLongPress(onLongPress, onClick);

    const selected = selectedIds.includes(object.path);

    const cutted = bufferIds.includes(object.path) && isCutMode;

    return (
        <Card
            data-id={object.path}
            className={'selectable'}
            onDoubleClick={onDoubleClick}

            {...longPressEvent}
            onClick={onClick}

            sx={{
                position: 'relative',
                minWidth: 20,
                opacity:  cutted ? 0.5 : 1,
                minHeight: 50,
                backgroundColor: selected ? "objectSelected" : "transparent",
                borderRadius: 2,
                display: 'flex',         // Добавляем flex-контейнер
                alignItems: 'center',    // Выравниваем по вертикали
                paddingLeft: 5,          // Немного отступа от края
                '&:hover': {
                    backgroundColor: selected ? "objectSelected" : "objectHover",
                }
            }}
            elevation={0}
        >
            <Box sx={{position: 'absolute', width: '20px', left: 8, bottom: 5,}}>
                <FileFormatIcon name={object.name} style={style}/>

                {cutted && <ContentCutIcon
                    sx={{color: 'black', position: 'absolute', fontSize: '15px', bottom: 11, left: 3}}/>}

            </Box>

            <ObjectListName object={object}/>

            {selected &&
                <CheckIcon
                    sx={{
                        position: 'absolute',
                        right: '8px', // Отступ от правого края
                        color: 'primary.dark', // Цвет галочки
                    }}
                />
            }

        </Card>
    );
}