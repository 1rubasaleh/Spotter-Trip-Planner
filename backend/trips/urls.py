# Defines the URL routes for the trips app.
# The /plan/ endpoint sends the request to the plan_trip view.

from django.urls import path

from .views import plan_trip

urlpatterns = [
    path('plan/', plan_trip),
]