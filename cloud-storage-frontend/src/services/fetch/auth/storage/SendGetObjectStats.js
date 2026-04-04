import {API_FILES} from "../../../../UrlConstants.jsx";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";


export const sendGetObjectStats = async (object = "") => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for get object stats");
        return {
            path: "/",
            name: "mocked_file.txt",
            size: 100,
            type: "FILE"
        };
    }

    const params = new URLSearchParams({path: object});

    const url = `${API_FILES}?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    });


    if (!response.ok) {
        const error = await response.json();
        throwSpecifyException(response.status, error);
    }

    return await response.json();

}