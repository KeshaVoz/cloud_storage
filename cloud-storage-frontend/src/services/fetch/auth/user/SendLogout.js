import {API_LOGOUT} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";


export const sendLogout = async () => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for logout");
        return;
    }

    const response = await fetch(API_LOGOUT, {
        method: 'POST',

        credentials: 'include'
    });

    console.log("Ответ на запрос о выходе: ");
    console.log(response);
    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(error);
    }

}