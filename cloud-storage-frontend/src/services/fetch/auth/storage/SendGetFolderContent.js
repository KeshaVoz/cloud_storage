import {API_DIRECTORY} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";
import {mapToFrontFormat} from "../../../util/FormatMapper.js";


export const sendGetFolderContent = async (folderName = "") => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for get folder content");

        let mockedResponse = [];
        if (folderName === "") {
            mockedResponse = [
                {
                    path: "",
                    name: "mocked_file.txt",
                    size: 100,
                    type: "FILE"
                },
                {
                    path: "",
                    name: "mocked_folder1/",
                    type: "DIRECTORY"
                }
            ];
        } else {
            mockedResponse = [
                {
                    path: "",
                    name: "mocked_inner_file.txt",
                    size: 100,
                    type: "FILE"
                }
            ];
        }

        return mockedResponse.map(ob => mapToFrontFormat(ob));
    }

    console.log("ЗАпрос на содержимое папки: " + folderName);

    const params = new URLSearchParams({path: folderName});

    const url = `${API_DIRECTORY}?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });


    if (!response.ok) {
        const errorMessage = await response.json();
        throwSpecifyException(response.status, errorMessage);
    }

    let directory = await response.json();
    console.log("Получен контент из папки: " + folderName);
    console.log(directory);

    const oldDir = directory.map(ob => mapToFrontFormat(ob));
    console.log("Контент смаплен для формата фронтенда: ");
    console.log(oldDir);
    return oldDir;

}