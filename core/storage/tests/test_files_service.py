import pytest
from io import BytesIO
from storage.exceptions import ConflictError, ResourceNotFoundError


class TestUserFileServiceUpload:
    def test_upload_file_creates_in_minio(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        file_obj = BytesIO(b'test content')
        file_obj.name = 'test.txt'
        file_obj.content_type = 'text/plain'
        
        result = file_service.upload('test.txt', file_obj)
        
        assert result['name'] == 'test.txt'
        assert result['type'] == 'FILE'
        assert result['size'] == 12
        mock_minio.files.upload.assert_called_once()

    def test_upload_file_raises_conflict_if_exists(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = True
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        file_obj = BytesIO(b'test content')
        file_obj.name = 'existing.txt'
        file_obj.content_type = 'text/plain'
        
        with pytest.raises(ConflictError) as exc_info:
            file_service.upload('existing.txt', file_obj)
        
        assert 'already exists' in str(exc_info.value.message).lower()
        mock_minio.files.upload.assert_not_called()

    def test_upload_file_with_subdirectory(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        file_obj = BytesIO(b'content')
        file_obj.name = 'nested.txt'
        file_obj.content_type = 'text/plain'
        
        result = file_service.upload('nested.txt', file_obj, base_path='root/subdir/')
        
        assert result['name'] == 'nested.txt'
        assert result['path'] == 'root/subdir/'
        mock_minio.files.upload.assert_called_once()

    def test_upload_file_with_unicode_name(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
    
        from storage.services.filesystem_service import UserFileService
        file_service = UserFileService(f'user-{user.id}-files/', mock_minio)
    
        file_obj = BytesIO(b'content')
        file_obj.name = 'file.txt'
        file_obj.content_type = 'text/plain'
    
        result = file_service.upload('file.txt', file_obj)
    
        assert result['name'] == 'file.txt'

    def test_upload_empty_file(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
    
        from storage.services.filesystem_service import UserFileService
        file_service = UserFileService(f'user-{user.id}-files/', mock_minio)
    
        file_obj = BytesIO(b'')
        file_obj.name = 'empty.txt'
        file_obj.content_type = 'text/plain'
    
        result = file_service.upload('empty.txt', file_obj)
    
        assert result['size'] == 0
        mock_minio.files.upload.assert_called_once()

    

class TestUserFileServiceMove:
    def test_move_file_renames_successfully(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.side_effect = lambda key: key.endswith('old.txt')
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        result = file_service.move('old.txt', 'new.txt')
        
        assert result['name'] == 'new.txt'
        mock_minio.files.copy.assert_called_once()
        mock_minio.files.delete.assert_called_once()

    def test_move_file_raises_conflict_if_target_exists(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.side_effect = lambda key: key.endswith('existing.txt') or key.endswith('old.txt')
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        with pytest.raises(ConflictError) as exc_info:
            file_service.move('old.txt', 'existing.txt')
        
        assert 'already exists' in str(exc_info.value.message).lower()

    def test_move_file_raises_not_found_if_source_missing(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        with pytest.raises(ResourceNotFoundError):
            file_service.move('nonexistent.txt', 'new.txt')

    def test_move_file_case_change(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.side_effect = lambda key: key.endswith('File.txt')
    
        from storage.services.filesystem_service import UserFileService
        file_service = UserFileService(f'user-{user.id}-files/', mock_minio)
    
        result = file_service.move('File.txt', 'file.txt')
    
        assert result['name'] == 'file.txt'


class TestUserFileServiceDelete:
    def test_delete_file_removes_from_minio(self, user, mocker):
        mock_minio = mocker.MagicMock()
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        file_service.delete('test.txt')
        
        call_args = mock_minio.files.delete.call_args
        assert call_args[0][0].endswith('test.txt')


class TestUserFileServiceDownload:
    def test_download_file_returns_stream(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_stream = BytesIO(b'downloaded content')
        mock_minio.files.download.return_value = mock_stream
        
        from storage.services.filesystem_service import UserFileService
        user_root = f'user-{user.id}-files/'
        file_service = UserFileService(user_root, mock_minio)
        
        stream = file_service.download('test.txt')
        
        assert stream.read() == b'downloaded content'
        mock_minio.files.download.assert_called_once()
    
    def test_download_nonexistent_file(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.files.download.side_effect = ResourceNotFoundError('File not found')
    
        from storage.services.filesystem_service import UserFileService
        file_service = UserFileService(f'user-{user.id}-files/', mock_minio)
    
        with pytest.raises(ResourceNotFoundError):
            file_service.download('missing.txt')