import {API_DIRECTORY} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";


export const sendCreateFolder = async (path) => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for create folder");
        return;
    }

    console.log("Запрос на создание папки: " + path);


    const params = new URLSearchParams({ path: path});

    const url = `${API_DIRECTORY}?${params.toString()}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    console.log("Ответ на создание папки: ");
    console.log(response);
    if (!response.ok) {
        console.log("Ошибка со статусом: " + response.status);
        const errorMessage = await response.json();
        console.log(errorMessage);
        throwSpecifyException(response.status, errorMessage);
    }

    return await response.json();

}