import requests


def get_route(start, pickup, dropoff):

    coordinates = [
        start,
        pickup,
        dropoff
    ]

    coordinate_string = ";".join(
        f"{location['longitude']},{location['latitude']}"
        for location in coordinates
    )

    url = f"https://router.project-osrm.org/route/v1/driving/{coordinate_string}"

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true"
    }

    response = requests.get(url, params=params)

    response.raise_for_status()

    data = response.json()

    if data["code"] != "Ok":
        return None

    route = data["routes"][0]

    return {
        "distance": route["distance"],
        "duration": route["duration"],
        "geometry": route["geometry"]
    }