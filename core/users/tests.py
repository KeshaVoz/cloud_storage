import time
from django.test import Client, TestCase
from django.contrib.auth import get_user_model
import redis

User = get_user_model()


class UserServiceIntegrationTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.redis_client = redis.Redis(host='localhost', port=6379, db=1, password='redis')

    def test_login_creates_session_in_redis(self) -> None:
        User.objects.create_user(username='testuser', password='testpass123')
        response = self.client.post('/login/', {
            'username': 'testuser',
            'password': 'testpass123',
        })
        session = self.client.session
        self.assertIsNotNone(session.session_key)
        keys = self.redis_client.keys('*')
        found = False
        for key in keys:
            if key.decode().endswith(session.session_key):
                found = True
                break
        self.assertTrue(found)

    def test_logout_clears_session_from_redis(self) -> None:
        User.objects.create_user(username='testuser', password='testpass123')
        self.client.login(username='testuser', password='testpass123')
        session = self.client.session
        self.assertIsNotNone(session.session_key)
        keys = self.redis_client.keys('*')
        found = False
        for key in keys:
            if key.decode().endswith(session.session_key):
                found = True
                break
        self.assertTrue(found)
        self.client.get('/logout/')
        self.assertIsNone(self.client.session.session_key)
        keys = self.redis_client.keys('*')
        found = False
        for key in keys:
            if key.decode().endswith(session.session_key):
                found = True
                break
        self.assertFalse(found)

    def test_session_expiration_from_redis(self) -> None:
        User.objects.create_user(username='testuser', password='testpass123')
        self.client.login(username='testuser', password='testpass123')
        session = self.client.session
        self.assertIsNotNone(session.session_key)
        keys = self.redis_client.keys('*')
        found = False
        for key in keys:
            if key.decode().endswith(session.session_key):
                found = True
                break
        self.assertTrue(found)
        session.set_expiry(1)
        session.save()
        time.sleep(2)
        keys = self.redis_client.keys('*')
        found = False
        for key in keys:
            if key.decode().endswith(session.session_key):
                found = True
                break
        self.assertFalse(found)

    def test_register_user_creates_db_record(self) -> None:
        response = self.client.post('/register/', {
            'username': 'testuser',
            'password1': 'testpass123',
            'password2': 'testpass123',
        })
        user = User.objects.get(username='testuser')
        self.assertIsNotNone(user)
        self.assertTrue(user.is_authenticated)
        self.assertRedirects(response, '/')

    def test_register_user_with_non_unique_username_raises_exception(self) -> None:
        User.objects.create_user(username='existinguser', password='testpass123')
        response = self.client.post('/register/', {
            'username': 'existinguser',
            'password1': 'testpass123',
            'password2': 'testpass123',
        })
        self.assertEqual(User.objects.filter(username='existinguser').count(), 1)
        self.assertContains(response, 'A user with that username already exists.', status_code=200)
