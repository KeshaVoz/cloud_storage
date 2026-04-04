import {Box, Button, Card, Link} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import Typography from "@mui/material/Typography";
import ValidatedUsernameTextField from "../components/InputElements/TextField/ValidatedUsernameTextField.jsx";
import ValidatedPasswordField from "../components/InputElements/TextField/ValidatedPasswordField.jsx";
import {useNavigate} from "react-router-dom";
import ValidatedPasswordConfirmField from "../components/InputElements/TextField/ValidatedPasswordConfirmField.jsx";
import {useNotification} from "../context/Notification/NotificationProvider.jsx";
import {sendRegistrationForm} from "../services/fetch/unauth/SendRegistrationForm.js";
import ConflictException from "../exception/ConflictException.jsx";
import {useAuthContext} from "../context/Auth/AuthContext.jsx";
import BadRequestException from "../exception/BadRequestException.jsx";
import ForbiddenException from "../exception/ForbiddenException.jsx";


export const SignUp = () => {

    const shouldValidate = window.APP_CONFIG.validateRegistrationForm;


    const [username, setUsername] = useState('')
    const [usernameError, setUsernameError] = useState('');

    const [password, setPassword] = useState('')
    const [passwordError, setPasswordError] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [registrationLoading, setRegistrationLoading] = useState(false);

    const navigate = useNavigate();
    const {showError, showWarn, showSuccess} = useNotification();

    const {login} = useAuthContext();

    const handleSubmit = async () => {

        const requestData = {username, password};

        try {
            setRegistrationLoading(true);
            let response = await sendRegistrationForm(requestData);
            login(response);
            showSuccess("Регистрация и вход успешно выполнены", 5000);
        } catch (error) {
            switch (true) {
                case error instanceof ForbiddenException:
                case error instanceof ConflictException:
                case error instanceof BadRequestException:

                    showWarn(error.message);
                    setUsernameError(error.message);
                    break;

                default:
                    showError("Не удалось зарегистрироваться. Попробуйте позже");
                    console.log('Unknown error occurred! ');
            }
        }
        setRegistrationLoading(false);
    };


    const shouldShowPasswordField = !usernameError && username.length > 0;
    const shouldShowValidatePasswordField = !passwordError && shouldShowPasswordField && password.length > 0;
    const shouldShowButton = shouldShowValidatePasswordField && !confirmPasswordError && confirmPassword.length > 0;


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
                  height: 'auto',
              }}>

            <Typography component="h1" variant="h4" sx={{
                marginTop: 0,
                mb: 2,
                textAlign: 'center',
            }}>
                Регистрация
            </Typography>

            <form onSubmit={handleSubmit}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2,}}>

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

                    <ValidatedPasswordConfirmField
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        confirmPasswordError={confirmPasswordError}
                        setConfirmPasswordError={setConfirmPasswordError}
                        originalPassword={password}
                    />

                    <Button
                        disabled={shouldValidate && !shouldShowButton || confirmPasswordError}
                        fullWidth
                        type="submit"
                        variant="contained"
                        onClick={handleSubmit}
                        loading={registrationLoading}
                        loadingPosition="center"
                    >
                        Зарегистрироваться
                    </Button>


                    <Typography variant="body1" component="p"
                                sx={{
                                    width: '100%',
                                    textAlign: 'center'
                                }}>
                        Уже зарегистрированы?{' '}
                        <Link sx={{color: '#1976d2', cursor: 'pointer'}}
                              onClick={() => navigate("/login")}>
                            Войти
                        </Link>
                    </Typography>

                </Box>
            </form>

        </Card>
    )
}

