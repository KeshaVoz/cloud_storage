from django.urls import path
from . import views


app_name = 'users'  

urlpatterns = [
    path('sign-up', views.RegisterAPIView.as_view(), name = 'api-sign-up'),   
    path('sign-in', views.LoginAPIView.as_view(), name = 'api-sign-in'),
    path('sign-out', views.LogoutAPIView.as_view(), name = 'api-sign-out'),
]

  
