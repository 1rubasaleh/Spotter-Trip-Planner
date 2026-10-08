# Defines the URL routes for the trips app.
# The main URL (/api/trips/) is defined in config/urls.py,
# and this file adds the remaining part of the URL, such as /plan/.
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/trips/', include('trips.urls')),
]