import pytest
from storage.exceptions import ConflictError, FolderNotFoundError


class TestUserFolderServiceCreate:
    def test_create_folder_creates_placeholder(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
        
        from storage.services.filesystem_service import UserFolderService
        user_root = f'user-{user.id}-files/'
        folder_service = UserFolderService(user_root, mock_minio)
        
        result = folder_service.create('newfolder/')
        
        assert result['name'] == 'newfolder/'
        assert result['type'] == 'DIRECTORY'
        mock_minio.folders.create_placeholder.assert_called_once()

    def test_create_folder_raises_conflict_if_exists(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = True
        
        from storage.services.filesystem_service import UserFolderService
        user_root = f'user-{user.id}-files/'
        folder_service = UserFolderService(user_root, mock_minio)
        
        with pytest.raises(ConflictError) as exc_info:
            folder_service.create('existing/')
        
        assert 'already exists' in str(exc_info.value.message).lower()
        mock_minio.folders.create_placeholder.assert_not_called()

    def test_create_folder_raises_not_found_if_parent_missing(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
        
        from storage.services.filesystem_service import UserFolderService
        user_root = f'user-{user.id}-files/'
        folder_service = UserFolderService(user_root, mock_minio)
        
        with pytest.raises(FolderNotFoundError):
            folder_service.create('parent/child/')
    
    def test_create_folder_with_trailing_dot(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
    
        from storage.services.filesystem_service import UserFolderService
        folder_service = UserFolderService(f'user-{user.id}-files/', mock_minio)
    
        result = folder_service.create('folder./')
    
        assert result['name'].endswith('/')

    def test_create_folder_in_root(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
    
        from storage.services.filesystem_service import UserFolderService
        folder_service = UserFolderService(f'user-{user.id}-files/', mock_minio)
    
        result = folder_service.create('newfolder/')
    
        assert result['path'] == ''
        assert result['name'] == 'newfolder/'



class TestUserFolderServiceMove:
    def test_move_folder_renames_successfully(self, user, mocker):
        mock_minio = mocker.MagicMock()
        
        mock_minio.search.exists.side_effect = lambda key: key.endswith('old/')
        
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/old/file.txt', 'Size': 100, 'LastModified': None},
        ]
        
        from storage.services.filesystem_service import UserFolderService
        user_root = f'user-{user.id}-files/'
        folder_service = UserFolderService(user_root, mock_minio)
        
        result = folder_service.move('old/', 'new/')
        
        assert result['name'] == 'new/'
        mock_minio.files.copy.assert_called()
        mock_minio.folders.create_placeholder.assert_called()

    def test_move_folder_raises_conflict_if_target_exists(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.side_effect = lambda key: key.endswith('existing/') or key.endswith('old/')
        mock_minio.search.list_objects.return_value = []
        
        from storage.services.filesystem_service import UserFolderService
        user_root = f'user-{user.id}-files/'
        folder_service = UserFolderService(user_root, mock_minio)
        
        with pytest.raises(ConflictError):
            folder_service.move('old/', 'existing/')
    
    def test_move_folder_into_itself(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = True
    
        from storage.services.filesystem_service import UserFolderService
        folder_service = UserFolderService(f'user-{user.id}-files/', mock_minio)
    
        with pytest.raises(ConflictError):
            folder_service.move('folder/', 'folder/subfolder/')
    



class TestUserFolderServiceDelete:
    def test_delete_folder_removes_recursive(self, user, mocker):
        mock_minio = mocker.MagicMock()
        
        from storage.services.filesystem_service import UserFolderService
        user_root = f'user-{user.id}-files/'
        folder_service = UserFolderService(user_root, mock_minio)
        
        folder_service.delete('test/')
        
        call_args = mock_minio.folders.delete_recursive.call_args
        assert call_args[0][0].endswith('test/')
    
    def test_delete_nonexistent_folder(self, user, mocker):
        mock_minio = mocker.MagicMock()
    
        from storage.services.filesystem_service import UserFolderService
        folder_service = UserFolderService(f'user-{user.id}-files/', mock_minio)

        folder_service.delete('nonexistent/')
    
        mock_minio.folders.delete_recursive.assert_called_once()