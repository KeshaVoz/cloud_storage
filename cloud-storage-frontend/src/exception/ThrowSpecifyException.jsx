import UnauthorizedException from "./UnauthorizedException.jsx";
import ConflictException from "./ConflictException.jsx";
import ForbiddenException from "./ForbiddenException.jsx";
import NotFoundException from "./NotFoundException.jsx";
import StorageExceedException from "./StorageExceedException.jsx";
import BadRequestException from "./BadRequestException.jsx";


export const throwSpecifyException = (status, detail) => {

    switch (status) {
        case 400:
            throw new BadRequestException(detail.message);
        case 401:
            throw new UnauthorizedException(detail.message);
        case 409:
            throw new ConflictException(detail.message);
        case 403:
            throw new ForbiddenException(detail.message);

        case 404:
            throw new NotFoundException(detail.message);

        case 413:
            throw new StorageExceedException(detail.message);
        default:
            throw new Error('Unknown error');
    }

}