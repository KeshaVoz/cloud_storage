import StorageIcon from '@mui/icons-material/Storage';
import {Button} from "@mui/material";
import {useNavigate} from "react-router-dom";

export const FileButton = () => {

    const navigate = useNavigate();

    return (
        <Button

            onClick={() => navigate('/files')}
            sx={{
                display: {xs: 'none', sm: "flex"},
                minWidth: 40,
                width: 40,
                height: 40,
                ml: 2,
                boxShadow: 2,
                marginRight: '8px',
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                color: "text.secondary",
                backgroundColor: 'inputSearch',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <StorageIcon sx={{
                fontSize: '25px',
            }}/>

        </Button>
    )
}