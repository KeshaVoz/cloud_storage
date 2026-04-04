import {API_USER_INFO} from "../../../../UrlConstants.jsx";
import UnauthorizedException from "../../../../exception/UnauthorizedException.jsx";


export const checkSession = async () => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for check session");
        return {
            username: "mocked_user"
        };
    }

    const response = await fetch(API_USER_INFO, {
        method: 'GET',
        credentials: 'include'
    });

    console.log("Проверка сессии: ");
    console.log(response);
    if (!response.ok) {
        console.log("Ошибка со статусом: " + response.status);
        const error = await response.json();
        throw new UnauthorizedException(error.detail);
    }

    return await response.json();
}