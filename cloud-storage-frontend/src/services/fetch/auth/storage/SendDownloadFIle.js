import {API_DOWNLOAD_FILES} from "../../../../UrlConstants.jsx";
import {extractSimpleName} from "../../../util/Utils.js";
import {sendGetObjectStats} from "./SendGetObjectStats.js";
import {throwSpecifyException} from "../../../../exception/ThrowSpecifyException.jsx";


export const sendDownloadFile = async (downloadTask, updateTask, updateDownloadTask, size, updateDownloadSpeed) => {
    if (import.meta.env.VITE_MOCK_FETCH_CALLS) {
        console.log("Mocked fetch call for download file");
        return;
    }

    const filePath = downloadTask.operation.source;

    const params = new URLSearchParams({path: filePath});

    const fetchUrl = `${API_DOWNLOAD_FILES}?${params.toString()}`;

    console.log("Пытаемся скачать: " + filePath);

    if (size === 0) {
        console.log("Пытаемся получить размер: " + filePath);

        try {
            let stats = await sendGetObjectStats(filePath);
            size = stats.size;
        } catch (e){
            console.log('Не получилось извлечь размер папки')
            console.log(e);
        }

    }

    const response = await fetch(fetchUrl, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        console.log(response);
        console.log('Ошибка при скачивании: ' + response.status);
        const error = await response.json();
        console.log(error);
        throwSpecifyException(response.status, error);
        return;
    }


    const updateSpeed = (speed) => {
        updateDownloadSpeed(downloadTask, speed);
    };

    let loadedSize = 0;
    const reader = response.body.getReader();
    const chunks = [];

    const contentName = filePath.endsWith("/")
        ? extractSimpleName(filePath).replace("/", ".zip")
        : extractSimpleName(filePath);

    let lastLoadedSize = 0;
    let count = 0;
    // Запускаем интервал обновления скорости (раз в секунду)
    const speedInterval = setInterval(() => {
        const speed = (loadedSize - lastLoadedSize); // Скорость в КБ/с
        lastLoadedSize = loadedSize;

        updateSpeed(speed); // Обновляем скорость загрузки
    }, 1000);


    while (true) {
        count++;
        const {done, value} = await reader.read();
        if (done) break;

        chunks.push(value);
        loadedSize += value.length;

        if (count === 100) {
            count = 0;
            const progress = (loadedSize / size) * 100;
            updateDownloadTask(downloadTask, progress);
        }
    }
    clearInterval(speedInterval);

    const blob = new Blob(chunks);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', contentName);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
};