import {AppBar, Box, Container, Toolbar} from "@mui/material";
import DarkModeSwitcher from "./DarkModeSwitcher.jsx";
import MainLabel from "./MainLabel.jsx";
import {HeaderSearchField} from "../InputElements/HeaderSearchField.jsx";
import {useAuthContext} from "../../context/Auth/AuthContext.jsx";
import {Settings} from "./SettingsMenu/Settings.jsx";
import {SelectHeader} from "../Selection/SelectHeader/SelectHeader.jsx";
import {FileButton} from "./FileButton.jsx";


export default function Header() {
    const {auth} = useAuthContext();

    return (
        <AppBar component="nav" position="fixed" elevation={0}
                sx={{
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    borderBottom: "1px solid ",
                    backgroundColor: 'header',
                    borderColor: 'divider',
                    height: "64px",
                }}
        >

            <SelectHeader/>

            <Container disableGutters>
                <Toolbar sx={{height: "65px",}} disableGutters>
                    <MainLabel/>

                    <Box sx={{flexGrow: 1, height: 1}}/>
                    {auth.isAuthenticated && <FileButton/>}
                    {auth.isAuthenticated && <HeaderSearchField/>}

                    <DarkModeSwitcher/>

                    <Settings/>

                </Toolbar>

            </Container>
        </AppBar>
    )
};
