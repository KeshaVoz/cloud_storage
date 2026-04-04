

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23", // 24-часовой формат (без AM/PM)
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(date).replace(",", ""); // Удаляем лишнюю запятую
};

export const extractSimpleName = (path) => {
    let sep = path.lastIndexOf("/", path.length - 2);
    return path.substring(sep + 1);

}

export function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}-${minutes}-${seconds}`;
}