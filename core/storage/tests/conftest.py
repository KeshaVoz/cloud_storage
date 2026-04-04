import pytest
from dataclasses import dataclass


@dataclass
class FakeUser:
    id: int
    username: str


@pytest.fixture
def user():
    return FakeUser(id=1, username='testuser')


