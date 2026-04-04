import ValidatedTextField from "./ValidatedTextField.jsx";
import * as React from "react";
import {useEffect} from "react";


export default function ValidatedFileName({
                                              filename,
                                              setFilename,
                                              filenameError,
                                              setFilenameError,
                                              label = 'Название'
                                          }) {

    const minLength = window.APP_CONFIG.validFolderName.minLength;
    const maxLength = window.APP_CONFIG.validFolderName.maxLength;
    const folderPattern = RegExp(window.APP_CONFIG.validFolderName.pattern);


    const validateUsername = (value) => {
        let isValid = true;
        let errMessage = '';

        if (value && value.length === 0) {
            errMessage = 'Имя не должно быть пустым. ';
            isValid = false;
        }

        if (value && value.length < minLength) {
            errMessage = 'Минимальная длина имени ' + minLength + ' символов. ';
            isValid = false;
        }


        if (value && value.length > maxLength) {
            errMessage += 'Максимальная длина имени ' + maxLength + ' символов. ';
            isValid = false;
        }

        if (value && !folderPattern.test(value)) {
            errMessage += 'Недопустимые символы в имени. ';
            isValid = false;
        }

        if (isValid) {
            setFilenameError('');
        } else {
            setFilenameError(errMessage);
        }
        setFilename(value);
    }

    useEffect(() => {
        validateUsername(filename);
    }, [filename])

    return (

        <ValidatedTextField
            id="filename"
            label={label}

            type="text"

            value={filename}
            onChange={(e) => validateUsername(e.target.value)}
            error={filenameError}
            helperText={filenameError}
        />
    )
}