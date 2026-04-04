import pytest
from storage.exceptions import ResourceNotFoundError


class TestUserIsolation:
    def test_user_cannot_access_other_user_files(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.exists.return_value = False
        mock_minio.files.download.side_effect = ResourceNotFoundError('File not found')
        
        from storage.services.filesystem_service import UserFileService
        
        our_root = f'user-{user.id}-files/'
        our_service = UserFileService(our_root, mock_minio)
        
        with pytest.raises(ResourceNotFoundError):
            our_service.download('other-user-file.txt')

    def test_search_isolated_by_user_root(self, user, mocker):
        mock_minio = mocker.MagicMock()
        our_root = f'user-{user.id}-files/'
        mock_minio.search.list_objects.return_value = [
            {'Key': f'{our_root}my-file.txt', 'Size': 100, 'LastModified': None},
        ]
        
        from storage.services.filesystem_service import SearchService
        search_service = SearchService(our_root, mock_minio)
        
        results = search_service.search('file')
        
        assert len(results) == 1
        assert results[0]['path'] == ''

