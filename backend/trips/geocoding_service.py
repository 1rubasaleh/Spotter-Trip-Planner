
import time

import requests


_geocoding_cache = {}

_session = requests.Session()

_session.headers.update({
    "User-Agent": "Spotter-Trip-Planner/1.0"
})


def geocode_location(location):

    location = location.strip()

    if location in _geocoding_cache:
        return _geocoding_cache[location]

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": location,
        "format": "json",
        "limit": 1,
    }

    for attempt in range(3):

        response = _session.get(
            url,
            params=params,
            timeout=10,
        )

        if response.status_code == 429:

            retry_after = response.headers.get("Retry-After")

            if retry_after:
                try:
                    wait_seconds = min(int(retry_after), 10)
                except ValueError:
                    wait_seconds = 2
            else:
                wait_seconds = 2

            time.sleep(wait_seconds)
            continue

        response.raise_for_status()

        data = response.json()

        if not data:
            return None

        coordinates = {
            "latitude": float(data[0]["lat"]),
            "longitude": float(data[0]["lon"]),
        }

        _geocoding_cache[location] = coordinates

        return coordinates

    raise Exception(
        "The location service is temporarily unavailable. Please try again later."
    )



