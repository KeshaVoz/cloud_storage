import axios from "axios";
import {API_FILES} from "../../../../UrlConstants.jsx";
import StorageExceedException from "../../../../exception/StorageExceedException.jsx";
import bytes from "bytes";


export async function sendUpload(files, updateDownloadTask, updateTask, uploadTask, currPath) {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for upload file");

        updateTask(uploadTask, "completed", "Загружено");

        return;
    }

    console.log("Файлы загружен на фронт: ");
    console.log(files);

    const formData = new FormData();
    files.forEach(({file, path}) => {
        formData.append("object", file, path);
    })
    formData.append("path", currPath);


    try {
        console.log("Отправляем файлы на бэк ");

        const response = await axios.post(API_FILES, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
                updateTask(uploadTask, "progress", "Загружаем... " + bytes(progressEvent.rate) + "/c");
                if (progressEvent.progress === 1) {
                    updateTask(uploadTask, "progress", "Сохраняем в хранилище...")
                }

                updateDownloadTask(uploadTask, progressEvent.progress * 100);
            },
        });

        if (response.status === 201) {
            updateTask(uploadTask, "completed", "Загружено");
        }
    } catch (error) {
        console.log(error);

        if (error.response.status === 409) {
            updateTask(uploadTask, "error", "Файл/папка с таким именем уже существует в целевой папке!");

        } else {
            updateTask(uploadTask, "error", "Ошибка при загрузке. Попробуйте позже");
        }
    }


}
