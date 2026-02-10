from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    is_premium = models.BooleanField(default=False)
