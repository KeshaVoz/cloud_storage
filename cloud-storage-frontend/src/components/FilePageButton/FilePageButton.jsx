import {Button} from "@mui/material";
import StorageIcon from '@mui/icons-material/Storage';
import {useNavigate} from "react-router-dom";

export const FilePageButton = () => {

    const navigate = useNavigate();
    return(
        <Button color="secondary"
             variant="contained"
             onClick={() => navigate("/files")}
        sx={{
            position: 'fixed',
            display: {xs: 'flex', sm: "none"},
            borderRadius: '50%',
            right: 15,
            bottom: 20,
            width: 80,
            height: 80,
            zIndex: 99999,
        }}
        >
            <StorageIcon sx={{fontSize: '30px'}}/>
        </Button>
    )
}