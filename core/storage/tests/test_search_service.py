import pytest
from storage.exceptions import ValidationError


class TestSearchService:
    def test_search_finds_files_by_name(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/document.txt', 'Size': 100, 'LastModified': None},
            {'Key': 'user-1-files/image.png', 'Size': 200, 'LastModified': None},
        ]
        
        from storage.services.filesystem_service import SearchService
        user_root = f'user-{user.id}-files/'
        search_service = SearchService(user_root, mock_minio)
        
        results = search_service.search('doc')
        
        assert len(results) == 1
        assert results[0]['name'] == 'document.txt'

    def test_search_returns_empty_if_no_matches(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/other.txt', 'Size': 50, 'LastModified': None},
        ]
        
        from storage.services.filesystem_service import SearchService
        user_root = f'user-{user.id}-files/'
        search_service = SearchService(user_root, mock_minio)
        
        results = search_service.search('nonexistent')
        
        assert len(results) == 0

    def test_search_raises_validation_error_on_empty_query(self, user, mocker):
        mock_minio = mocker.MagicMock()
        
        from storage.services.filesystem_service import SearchService
        user_root = f'user-{user.id}-files/'
        search_service = SearchService(user_root, mock_minio)
        
        with pytest.raises(ValidationError) as exc_info:
            search_service.search('')
        
        assert 'empty' in str(exc_info.value.message).lower()

    def test_search_ignores_folders(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/folder/', 'Size': 0, 'IsFolder': True},
            {'Key': 'user-1-files/file.txt', 'Size': 100, 'LastModified': None},
        ]
        
        from storage.services.filesystem_service import SearchService
        user_root = f'user-{user.id}-files/'
        search_service = SearchService(user_root, mock_minio)
        
        results = search_service.search('folder')
        
        assert len(results) == 0
    
    def test_search_case_insensitive(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/DOCUMENT.TXT', 'Size': 100, 'LastModified': None},
        ]
    
        from storage.services.filesystem_service import SearchService
        search_service = SearchService(f'user-{user.id}-files/', mock_minio)
    
        results = search_service.search('document')
    
        assert len(results) == 1
        assert results[0]['name'] == 'DOCUMENT.TXT'
    
    def test_search_partial_match(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/my_document_v2_final.txt', 'Size': 100, 'LastModified': None},
        ]
    
        from storage.services.filesystem_service import SearchService
        search_service = SearchService(f'user-{user.id}-files/', mock_minio)
    
        results = search_service.search('doc')
    
        assert len(results) == 1
    
    def test_search_with_whitespace_query(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = [
            {'Key': 'user-1-files/file.txt', 'Size': 100, 'LastModified': None},
        ]
    
        from storage.services.filesystem_service import SearchService
        search_service = SearchService(f'user-{user.id}-files/', mock_minio)
    
        results = search_service.search('  file  ')
    
        assert len(results) == 1
    
    def test_search_nonexistent_prefix(self, user, mocker):
        mock_minio = mocker.MagicMock()
        mock_minio.search.list_objects.return_value = []
    
        from storage.services.filesystem_service import SearchService
        search_service = SearchService(f'user-{user.id}-files/', mock_minio)
    
        results = search_service.search('xyz123')
    
        assert len(results) == 0