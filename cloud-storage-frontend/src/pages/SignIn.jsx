import {Box, Button, Card, Link} from "@mui/material";
import React, {useState} from "react";
import Typography from "@mui/material/Typography";
import ValidatedUsernameTextField from "../components/InputElements/TextField/ValidatedUsernameTextField.jsx";
import ValidatedPasswordField from "../components/InputElements/TextField/ValidatedPasswordField.jsx";
import {useNavigate} from "react-router-dom";
import {sendLoginForm} from "../services/fetch/unauth/SendLoginForm.js";
import {useAuthContext} from "../context/Auth/AuthContext.jsx";
import {useNotification} from "../context/Notification/NotificationProvider.jsx";
import UnauthorizedException from "../exception/UnauthorizedException.jsx";
import NotFoundException from "../exception/NotFoundException.jsx";
import BadRequestException from "../exception/BadRequestException.jsx";


export const SignIn = () => {

    const shouldValidate = window.APP_CONFIG.validateLoginForm;

    const {login} = useAuthContext();

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const {showError, showInfo, showWarn} = useNotification();

    const handleSubmit = async () => {
        const requestData = {username, password,};

        try {
            setLoading(true);
            const profile = await sendLoginForm(requestData);
            login(profile);
            showInfo("Вход успшено выполнен", 4000);
        } catch (error) {
            switch (true) {
                case error instanceof UnauthorizedException:
                    showWarn(error.message);
                    setUsernameError(error.message);
                    break;

                case error instanceof NotFoundException:
                    showWarn(error.message);
                    setUsernameError(error.message);
                    break;
                case error instanceof BadRequestException:
                    showWarn(error.message);
                    setUsernameError(error.message);
                    break;

                default:
                    showError("Ошибка при попытке входа. Попробуйте позже");
                    console.log('Unknown error occurred! ');
            }
        }
        setLoading(false);
    };

    const shouldShowPasswordField = !usernameError && username.length > 0;
    const shouldShowButton = !passwordError && shouldShowPasswordField && password.length > 0;
    return (
        <Card variant="outlined"
              sx={{
                  padding: 3,
                  boxShadow: 3,
                  position: 'fixed',
                  top: '20%',
                  backgroundColor: 'searchInput',
                  alignSelf: 'center',
                  borderRadius: 2,
                  width: {xs: '85%', sm: '400px'},
                  height: 'auto'
              }}>

            <Typography component="h1" variant="h4" sx={{textAlign: 'center', mb: 2}}>
                Вход
            </Typography>

            <form onSubmit={handleSubmit}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>

                    <ValidatedUsernameTextField
                        username={username}
                        setUsername={setUsername}
                        usernameError={usernameError}
                        setUsernameError={setUsernameError}
                        shouldValidate={shouldValidate}
                    />


                    <ValidatedPasswordField
                        password={password}
                        setPassword={setPassword}
                        passwordError={passwordError}
                        setPasswordError={setPasswordError}
                        shouldValidate={shouldValidate}

                    />


                    <Button
                        loadingPosition="center"
                        fullWidth
                        type="submit"
                        variant="contained"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={shouldValidate && !shouldShowButton}
                    >
                        Войти
                    </Button>


                    <Typography variant="body1" component="p"
                                sx={{
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                        Еще нет аккаунта?{' '}
                        <Link sx={{color: '#1976d2', cursor: 'pointer'}}
                              onClick={() => navigate("/registration")}>
                            Регистрация
                        </Link>
                    </Typography>

                </Box>
            </form>
        </Card>
    )
}

