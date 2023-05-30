from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/deployment/', views.deployment),
    # path('api/submit-deployment', views.handle_form_submission, name='submit_form'),
]
