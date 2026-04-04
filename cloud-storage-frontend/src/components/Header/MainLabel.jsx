import Typography from "@mui/material/Typography";
import CloudIcon from '@mui/icons-material/Cloud';
import {useNavigate} from "react-router-dom";
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import {Box} from "@mui/material";

export default function MainLabel() {
    const navigate = useNavigate();

    const name = window.APP_CONFIG.mainName;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                '&:hover': {
                    color: 'text.primary',
                    textDecoration: 'none',
                    cursor: 'pointer',
                }
            }}
            onClick={() => {
                navigate("/");
            }}
        >
            <Box>
                <CloudIcon
                    sx={{
                        display: 'flex',
                        ml: 2,
                        mt: "2px",
                        color: 'rgba(47,155,255,0.8)',
                        fontSize: {xs: '45px', md: '32px',}
                    }}/>
                <VpnKeyIcon
                    sx={{
                        position: 'absolute',
                        color: 'background.paper',
                        top: 27,
                        fontSize: {xs: '20px', md: '15px'},
                        left: {xs: 28, md: 24}
                    }}/>
            </Box>

            <Typography
                variant="h6"
                sx={{
                    ml: 1,
                    fontWeight: 'fontWeightBold',
                    letterSpacing: '.2rem',
                    color: 'text.primary',
                    textDecoration: 'none',
                    display: {xs: 'none', md: 'flex'}
                }}>
                {name}
            </Typography>
        </Box>
    )
}