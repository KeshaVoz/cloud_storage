import {useCustomThemeContext} from "../../context/GlobalThemeContext/CustomThemeProvider.jsx";
import {IconButton, Tooltip} from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";

export default function DarkModeSwitcher() {
    const {isDarkMode, toggleTheme} = useCustomThemeContext();

    return (
        <Tooltip title="Change theme" variant="outlined">
            <IconButton sx={{mr: "6px",}} onClick={toggleTheme}>
                {isDarkMode ? <DarkModeRoundedIcon sx={{fontSize: '20px', color: 'info.dark'}}/> :
                    <LightModeRoundedIcon sx={{fontSize: '20px', color: 'warning.light'}}/>}
            </IconButton>
        </Tooltip>
    );
}

