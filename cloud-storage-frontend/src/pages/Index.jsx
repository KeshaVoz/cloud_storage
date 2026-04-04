import {Box, Container, Divider} from "@mui/material";
import {FilePageButton} from "../components/FilePageButton/FilePageButton.jsx";
import {useAuthContext} from "../context/Auth/AuthContext.jsx";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router-dom";

export default function Index() {

    const {auth} = useAuthContext();

    const navigate = useNavigate();

    return (
        <Container disableGutters className="cont" style={{
            alignItems: "center",
            alignContent: "center",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            width: "100%",
        }}>

            <Box sx={{maxWidth: '640px', pt: 10, pb: 30}}>
                <Typography variant="h4" sx={{mb: 2}}>О сайте</Typography>

                <Typography className="row justify-content-md-center mb-3 ">
                    <Typography variant="body1" className="col-lg-9 themed-grid-col text-center"> Простой сайт, который
                        представляет собой многопользовательское
                        файловое облако. Пользователи сервиса могут использовать его для загрузки и хранения файлов.
                        Проект создан в рамках работы над
                        <a href="https://zhukovsd.github.io/java-backend-learning-course/projects/cloud-file-storage/"> Java
                            Roadmap Сергея Жукова</a>

                    </Typography>
                </Typography>

                <Divider style={{marginTop: 20, marginBottom: 20, marginRight: 20, marginLeft: 20}}/>

                <Box >
                    <Typography  variant="body1" className="col-lg-8 themed-grid-col text-center">
                        Подробнее с функционалом можно познакомиться на странице
                        <Typography fontWeight="bold" onClick={() => navigate("/help")}
                        sx={{
                            cursor: "pointer",
                            color: 'info.main',
                        }}
                        >
                            помощи</Typography>
                    </Typography>
                </Box>

                <Divider style={{marginTop: 20, marginBottom: 20, marginRight: 20, marginLeft: 20}}/>


                {auth.isAuthenticated && <FilePageButton/>}
            </Box>
        </Container>
    )
}