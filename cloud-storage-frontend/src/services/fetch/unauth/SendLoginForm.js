import {API_LOGIN} from "../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../exception/ThrowSpecifyException.jsx";


export const sendLoginForm = async (registrationData) => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for login");
        
        return {
            username: "mocked_user"
        };
    }

    console.log("Запрос на вход: " + registrationData);

    const response = await fetch(API_LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',

        body: JSON.stringify(registrationData),
    });

    console.log("Ответ на запрос о входе: ");
    console.log(response);
    if (!response.ok) {
        console.log("Ошибка со статусом: " + response.status);
        const errorMessage = await response.json();
        throwSpecifyException(response.status, errorMessage);
    }

    return await response.json(response);
}