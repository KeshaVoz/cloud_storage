import {API_FILES_SEARCH} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";
import {mapToFrontFormat} from "../../../util/FormatMapper.js";


export const sendFindObjects = async (folderName = "", objectToFind) => {

    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for find objects");
        const mockedResponse = [
            {
                "path": "",
                name: "mocked_file.txt",
                size: 100,
                type: "FILE"
            }
        ];

        return mockedResponse.map(ob => mapToFrontFormat(ob));
    }

    console.log("Запрос на поиск: " + objectToFind);


    const params = new URLSearchParams({query: objectToFind});

    const url = `${API_FILES_SEARCH}?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });

    console.log("Ответ на запрос о поиске: ");
    console.log(response);

    if (!response.ok) {
        console.log("Ошибка со статусом: " + response.status);

        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    let searched = await response.json();
    console.log("Найдено: ");
    console.log(searched);

    const oldDir = searched.map(ob => mapToFrontFormat(ob));
    console.log("Контент смаплен для формата фронтенда: ");
    console.log(oldDir);

    return oldDir;

}