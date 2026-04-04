import React, {createContext, useContext, useEffect, useState} from "react";
import {sendDeleteObject} from "../../services/fetch/auth/storage/SendDeleteObject.js";
import {useStorageNavigation} from "../Storage/StorageNavigationProvider.jsx";
import {sendMoveObject} from "../../services/fetch/auth/storage/SendMoveObject.js";
import {extractSimpleName} from "../../services/util/Utils.js";
import {useStorageSelection} from "../Storage/StorageSelectionProvider.jsx";
import {nanoid} from 'nanoid';
import {sendDownloadFile} from "../../services/fetch/auth/storage/SendDownloadFIle.js";
import bytes from "bytes";
import RenameModal from "../../modals/FileChange/RenameModal.jsx";
import {sendUpload} from "../../services/fetch/auth/storage/SendUploadFIle.js";
import {useNotification} from "../Notification/NotificationProvider.jsx";
import StorageExceedException from "../../exception/StorageExceedException.jsx";

const FileOperationsContext = createContext();

export const useStorageOperations = () => useContext(FileOperationsContext);


export const FileOperationsProvider = ({children}) => {

    const {loadFolder, currentPath, getObjectByPath, folderContent, currentPathRef} = useStorageNavigation();
    const { isCutMode, bufferIds, endCopying, endCutting, selectedIds} = useStorageSelection();

    const [tasks, setTasks] = useState([]);
    const [newTasksAdded, setNewTasksAdded] = useState(false);


    const [nameConflict, setNameConflict] = useState(false);
    const [conflictedIds, setConflictedIds] = useState([]);

    const [taskRunning, setTaskRunning] = useState(false);

    const {showError} = useNotification();

    const nameAlreadyExists = (path) => {
        let fltrd = folderContent.filter(obj => obj.name === extractSimpleName(path));
        return fltrd.length > 0;
    }

    const checkConflicts = (ids) => {
        if (ids.length === 1 && nameAlreadyExists(ids[0])) {
            setConflictedIds(ids);
            setNameConflict(true);
            return true;
        }

        return false;
    }

    const createTask = (objectPath, target, type, message) => {
        const operation = {type: type, source: objectPath, target: target};
        return {id: nanoid(), operation: operation, status: "pending", message: message};
    }


    const identicalTasks = (task1) => {
        const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "progress");
        let filtered = pendingTasks.filter((task) => task.operation.source === task1.operation.source);
        return filtered.length > 0;
    }

    const deleteTask = (task) => {
        setTasks(prevTasks =>
            prevTasks.filter((inTask) => inTask.id !== task.id));
    }

    const clearTasks = () => {
        setTasks([]);
    }

    const allTasksCompleted = () => {
        let activeTasks = tasks.filter((task) => task.status === "pending" || task.status === "progress");

        return activeTasks.length === 0;
    }


    const updateTask = (task, newStatus = null, newMessage = null) => {
        setTasks(prevTasks =>
            prevTasks.map(inTask =>
                inTask.id === task.id
                    ? {
                        ...inTask, status: newStatus ? newStatus : inTask.status,
                        message: newMessage ? newMessage : inTask.message
                    }
                    : inTask
            )
        )
    }

    const uploadObjects = (files) => {

        const filesWithoutFolder = [];
        const innerFolders = {};

        files.forEach(({file, path}) => {
            const fileName = path; // Предполагаем, что file - это объект с полем name
            const firstSlash = fileName.indexOf("/");

            if (firstSlash === -1) {
                filesWithoutFolder.push({file, path});
            } else {
                const prefix = fileName.substring(0, firstSlash + 1);
                if (!innerFolders[prefix]) {
                    innerFolders[prefix] = [];
                }
                innerFolders[prefix].push({file, path});
            }
        });

        let namesWF = filesWithoutFolder.map(({file}) => file.name);
        let namesIF = Object.keys(innerFolders);

        const allNames = [...namesWF, ...namesIF];


        const uploadTasks = allNames.map(source => {
            let task = createTask(source, null, "upload", "В очереди на загрузку");
            if (nameAlreadyExists(source)) {
                task = {
                    ...task,
                    status: "error",
                    message: "'" + extractSimpleName(source) + "'" + ' уже существует в папке'
                };
            }
            let files = innerFolders[source] ? innerFolders[source] :
                [filesWithoutFolder.find(({file}) => file.name === source)];
            return {task, files}
        });


        let uniqueTasks = uploadTasks
            .map(({task, files}) => {
                task = {...task, progress: 0}
                return {task, files}
            })
            .filter(({task}) => !identicalTasks(task));

        setTasks(tasks => [...tasks, ...uniqueTasks.map(({task}) => task)]);
        setNewTasksAdded(true);

        executeUploadTasks(uniqueTasks);
    }


    const executeUploadTasks = async (uniqueTasks) => {
        const currPath = currentPathRef.current.textContent;


        setTaskRunning(true);

        try {
            await Promise.all(uniqueTasks.map(async ({task, files}) => {
                updateTask(task, "progress", "Загружаем...")
                await sendUpload(files, updateDownloadTask, updateTask, task, currPath);


            }));
        } catch (e) {
            switch (true) {
                case e instanceof StorageExceedException:
                    showError(e.message);
            }
            clearTasks();
        }
        setTimeout(() => {
            loadFolder(currPath);
        }, 300);

        setTaskRunning(false);


    }


    const deleteObject = (objects) => {
        let deleteTasks = objects.map(path => createTask(path, null, "delete", "В очереди на удаление"));
        let uniqueTasks = deleteTasks.filter((task) => !identicalTasks(task));

        setTasks([...tasks, ...uniqueTasks]);
        setNewTasksAdded(true);
        executeTasks(uniqueTasks);
    }

    const moveObjects = (sourceObjects, target) => {
        const moveTasks = sourceObjects.map(source => createTask(source, target + extractSimpleName(source), "move", "В очереди для перемещения"));


        let uniqueTasks = moveTasks.filter((task) => !identicalTasks(task));

        setTasks([...tasks, ...uniqueTasks]);
        setNewTasksAdded(true);
        executeTasks(uniqueTasks);
    }

    const moveObjectInternal = (sourcePath, targetPath) => {
        const moveTasks = sourcePath.map(source => createTask(source, targetPath, "move", "В очереди для перемещения"));
        let uniqueTasks = moveTasks.filter((task) => !identicalTasks(task));

        setTasks([...tasks, ...uniqueTasks]);
        setNewTasksAdded(true);
        executeTasks(uniqueTasks);
    }

    const renameObject = (oldPath, newPath) => {
        let task = createTask(oldPath, newPath, "move", "В очереди для переименования");

        if (identicalTasks(task)) {
            return;
        }

        setTasks([...tasks, task]);
        setNewTasksAdded(true);

        executeRename(task);
    }

    const copyObjects = (sourceObjects, target) => {
        const copyTasks = sourceObjects.map(source => createTask(source, target + extractSimpleName(source), "copy", "В очереди для копирования"));
        let uniqueTasks = copyTasks.filter((task) => !identicalTasks(task));

        setTasks([...tasks, ...uniqueTasks]);
        setNewTasksAdded(true);
        executeTasks(uniqueTasks);
    }

    const copyObjectInternal = (sourceObjects, target) => {
        const copyTasks = sourceObjects.map(source => createTask(source, target, "copy", "В очереди для копирования"));
        let uniqueTasks = copyTasks.filter((task) => !identicalTasks(task));

        setTasks([...tasks, ...uniqueTasks]);
        setNewTasksAdded(true);
        executeTasks(uniqueTasks);
    }

    const downloadObjects = (objectPath) => {
        const task = createTask(objectPath, null, "download", "В очереди на скачивание");
        if (identicalTasks(task)) {
            return;
        }

        const downloadTask = {...task, progress: 0};

        setTasks([...tasks, downloadTask]);
        setNewTasksAdded(true);
        //todo start execution right in task with useEffect()

        executeDownloadTask(downloadTask);
    }

    const updateDownloadTask = (task, progress) => {
        setTasks(prevTasks =>
            prevTasks.map(inTask =>
                inTask.id === task.id
                    ? {
                        ...inTask, progress: progress
                    }
                    : inTask
            )
        )
    }

    const updateDownloadSpeed = (task, speed) => {
        setTasks(prevTasks =>
            prevTasks.map(inTask =>
                inTask.id === task.id
                    ? {
                        ...inTask, message: "Скачиваем... " + bytes(speed) + "/с"
                    }
                    : inTask
            )
        )
    }

    const executeDownloadTask = async (downloadTask) => {
        updateTask(downloadTask, "progress", "Скачиваем...")
        let obj = getObjectByPath(downloadTask.operation.source);
        let size = obj ? obj.size : 0;
        try {
            await sendDownloadFile(downloadTask, updateTask, updateDownloadTask, size, updateDownloadSpeed);
            updateTask(downloadTask, "completed", "Скачивание завершено")

        } catch (error) {
            console.log(error.message);
            updateTask(downloadTask, "error", error.message);

        }

    }

    async function executeRename(task) {
        try {
            setTaskRunning(true);
            updateTask(task, "progress", "Переименовываем...")
            await sendMoveObject(task.operation.source, task.operation.target);
            let extractSimpleName1 = extractSimpleName(task.operation.target);
            const newName = extractSimpleName1.endsWith("/") ? extractSimpleName1.slice(0, -1) : extractSimpleName1;
            updateTask(task, "completed", "Новое имя присвоено: " + newName)

        } catch (e) {
            updateTask(task, "error", e.message);
        }

        setTaskRunning(false);

    }


    const executeTasks = async (pendingTasks) => {
        setTaskRunning(true);

        try {
            for (const task of pendingTasks) {
                if (task.operation.type === "delete") {
                    await executeDeleteTask(task);
                }
                if (task.operation.type === "move") {
                    await executeMoveTask(task);
                }

            }
        } catch (e) {
            switch (true) {
                case e instanceof StorageExceedException:
                    showError(e.message);
            }
            clearTasks();
        }
        setTaskRunning(false);
    }

    useEffect(() => {
        if (!taskRunning && tasks.length > 0) {
            loadFolder(currentPath);
        }
    }, [taskRunning])


    async function executeMoveTask(task) {
        try {
            updateTask(task, "progress", "Перемещаем...")
            await sendMoveObject(task.operation.source, task.operation.target);
            updateTask(task, "completed", "Перемещение успешно выполнено")

        } catch (e) {
            updateTask(task, "error", e.message);
        }

    }

    const executeDeleteTask = async (task) => {
        try {
            updateTask(task, "progress", "Удаляем...");
            await sendDeleteObject(task.operation.source);
            updateTask(task, "completed", "Удаление успешно выполнено")

        } catch (e) {
            updateTask(task, "error", e.message);
        }
    }

    const pasteObjects = () => {
        if (bufferIds.length === 0) {
            return;
        }

        if (checkConflicts(bufferIds)) {
            return;
        }

        if (isCutMode) {
            moveObjects(bufferIds, currentPath);
            endCutting();
        }
    }


    const clearSelectionMode = () => {
        endCutting();
        endCopying();
        setConflictedIds([]);
    }

    const handleModalConflictClose = () => {
        setNameConflict(false);
        clearSelectionMode();
    }

    const resolveConflict = (newName) => {
        if (isCutMode) {
            moveObjectInternal(bufferIds, currentPath + newName);
            endCutting();
        }  else {
            const path = conflictedIds[0];
            let sep = path.lastIndexOf("/", path.length - 2);
            const newPath = path.substring(0, sep + 1) + newName;
            moveObjectInternal(selectedIds, newPath);
        }

        handleModalConflictClose();
    }


    useEffect(() => {

        let activeTasks = tasks.filter((task) => task.status === "pending" || task.status === "progress");

        const handleBeforeUnload = (event) => {
            if (activeTasks.length > 0) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [tasks]);

    return (<FileOperationsContext.Provider
        value={{
            tasks,
            newTasksAdded,
            setNewTasksAdded,
            deleteTask,
            clearTasks,
            allTasksCompleted,


            deleteObject,
            moveObjects,
            pasteObjects,
            downloadObjects,
            renameObject,
            uploadObjects
        }}>
        {children}
        <RenameModal selectedIds={conflictedIds}
                     open={nameConflict}
                     onClose={handleModalConflictClose}
                     clearSelectionMode={clearSelectionMode}
                     isConflict={true}
                     resolveConflict={resolveConflict}
        />
    </FileOperationsContext.Provider>);
}