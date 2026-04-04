import {Backdrop, Box, CircularProgress, IconButton, Input} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useState} from "react";
import {sendFindObjects} from "../../services/fetch/auth/storage/SendFindObjects.js";
import {useStorageNavigation} from "../../context/Storage/StorageNavigationProvider.jsx";
import {useStorageSelection} from "../../context/Storage/StorageSelectionProvider.jsx";
import {useNavigate} from "react-router-dom";
import {useNotification} from "../../context/Notification/NotificationProvider.jsx";
import BadRequestException from "../../exception/BadRequestException.jsx";

export const HeaderSearchField = () => {

    const [searchText, setSearchText] = useState('');

    const [loading, setLoading] = useState(false);
    const {setSearchName, setSearchedContent, currentPathRef} = useStorageNavigation();
    const {setSelectedIds} = useStorageSelection();

    const {showInfo} = useNotification();

    const navigate = useNavigate();

    const inputChange = (event) => {
        setSearchText(event.target.value);
    }

    const {showWarn, showError} = useNotification();

    const handleSearch = async () => {
        if (!searchText) {
            return;
        }
        const currentFolder = currentPathRef.current.textContent;
        setLoading(true);

        try {
            let findList = await sendFindObjects(currentFolder, searchText.trim());
            console.log(findList);
            if (findList.length > 0) {
                setSearchName(searchText.trim());
                setSearchedContent(findList);
                navigate("/files");
            } else {
                showInfo("По вашему запросу ничего не найдено", 3000);
            }
        } catch (error) {
            switch (true) {
                case error instanceof BadRequestException:
                    showWarn(error.message);
                    break;
                default:
                    showError("Не удалось создать папку. Попробуйте позже");
                    console.log('Unknown error occurred! ');
            }
        }

        setSelectedIds([]);
        setSearchText(prev => prev.trim());
        setLoading(false);
    }

    return (
        <>

            <Box
                sx={{
                    border: '1px solid ',
                    m: '8px',
                    borderRadius: 2,
                    backgroundColor: 'searchInput',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    borderColor: 'divider',
                    boxShadow: 2,
                    pl: 1,
                    pr: 1,
                    width: {xs: '100%', sm: '300px',}
                }}
            >
                <Backdrop
                    sx={(theme) => ({borderRadius: 2, color: '#fff', zIndex: theme.zIndex.drawer + 1})}
                    open={loading}
                >
                    <CircularProgress size="34px" sx={{position: 'absolute', right: 3}} color="inherit"/>
                </Backdrop>

                <Input variant="outlined" placeholder="Поиск..." disableUnderline
                       value={searchText}
                       onChange={inputChange}
                       onKeyDown={(event) => {
                           if (event.key === "Enter" && loading) {
                               event.preventDefault();
                               return;
                           }
                           if (event.key === "Enter") {
                               event.preventDefault();
                               handleSearch();
                           }
                       }}
                       endAdornment={
                           <IconButton
                               onClick={handleSearch}
                               sx={{mr: -1}}>
                               <SearchIcon sx={{color: 'primary.main',}}/>
                           </IconButton>}
                       sx={{
                           height: '40px',
                           alignSelf: 'center',
                           width: '100%',
                       }}/>
            </Box>
        </>
    )
}