import ValidatedTextField from "./ValidatedTextField.jsx";
import * as React from "react";
import {useEffect} from "react";


export default function ValidatedPasswordField({
                                                   password, setPassword,
                                                   passwordError, setPasswordError,
                                                   label = 'Пароль', shouldValidate
                                               }) {

    const minLength = window.APP_CONFIG.validPassword.minLength;
    const maxLength = window.APP_CONFIG.validPassword.maxLength;
    const passwordPattern = RegExp(window.APP_CONFIG.validPassword.pattern);

    const validatePassword = (value) => {
        let isValid = true;
        let errMessage = '';

        if (value && value.length < minLength && shouldValidate) {
            errMessage = 'Минимальная длина пароля ' + minLength + ' символов. ';
            isValid = false;
        }
        if (value && !passwordPattern.test(value) && shouldValidate) {
            errMessage += 'Недопустимые символы в пароле ';
            isValid = false;
        }
        if (value && value.length > maxLength && shouldValidate) {
            errMessage += 'Максимальная длина пароля: ' + maxLength + ' символов. ';
            isValid = false;
        }

        if (isValid) {
            setPasswordError('');
        } else {
            setPasswordError(errMessage);
        }
        setPassword(value);
        localStorage.setItem('password', value);

    }

    useEffect(() => {
        validatePassword(password);
    }, [password]);

    return (
        <ValidatedTextField
            id="password"
            label={label}
            type="password"
            value={password}
            onChange={(e) => validatePassword(e.target.value)}
            helperText={passwordError}

        />
    )
}