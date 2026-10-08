import math


def _route_points(route_geometry):
    if route_geometry.get("type") != "LineString":
        return []

    coordinates = route_geometry.get("coordinates", [])
    if len(coordinates) < 2:
        return []

    points = []
    for coordinate in coordinates:
        if len(coordinate) < 2:
            return []

        longitude, latitude = map(float, coordinate[:2])
        if (
            not math.isfinite(latitude)
            or not math.isfinite(longitude)
            or not -90 <= latitude <= 90
            or not -180 <= longitude <= 180
        ):
            return []

        points.append((longitude, latitude))

    return points


def _segment_distance(first, second):
    longitude1, latitude1 = map(math.radians, first)
    longitude2, latitude2 = map(math.radians, second)
    latitude_delta = latitude2 - latitude1
    longitude_delta = longitude2 - longitude1

    haversine = (
        math.sin(latitude_delta / 2) ** 2
        + math.cos(latitude1)
        * math.cos(latitude2)
        * math.sin(longitude_delta / 2) ** 2
    )
    return 2 * 6371000 * math.asin(math.sqrt(haversine))


def coordinate_at_route_fraction(route_geometry, fraction):
    points = _route_points(route_geometry)
    if not points:
        return None

    segment_distances = [
        _segment_distance(first, second)
        for first, second in zip(points, points[1:])
    ]
    route_length = sum(segment_distances)
    if route_length == 0:
        return [points[0][1], points[0][0]]

    target_distance = min(max(fraction, 0), 1) * route_length
    traversed_distance = 0

    for index, segment_distance in enumerate(segment_distances):
        if traversed_distance + segment_distance >= target_distance:
            segment_fraction = (
                (target_distance - traversed_distance) / segment_distance
                if segment_distance
                else 0
            )
            first = points[index]
            second = points[index + 1]
            longitude = first[0] + (second[0] - first[0]) * segment_fraction
            latitude = first[1] + (second[1] - first[1]) * segment_fraction
            return [latitude, longitude]

        traversed_distance += segment_distance

    return [points[-1][1], points[-1][0]]


def get_fuel_stop_coordinates(route_geometry, distance_miles, fuel_stops):
    if distance_miles <= 0:
        return []

    coordinates = []
    for stop_number in range(1, fuel_stops + 1):
        coordinate = coordinate_at_route_fraction(
            route_geometry,
            stop_number * 1000 / distance_miles,
        )
        if coordinate is not None:
            coordinates.append(coordinate)

    return coordinates


def get_rest_stop_coordinates(route_geometry, daily_schedule, driving_hours):
    if driving_hours <= 0:
        return []

    coordinates = []
    total_driving_hours = 0

    for day in daily_schedule:
        for activity in day["activities"]:
            activity_type = activity["type"]
            if activity_type in ("break", "sleep"):
                coordinate = coordinate_at_route_fraction(
                    route_geometry,
                    total_driving_hours / driving_hours,
                )
                if coordinate is not None:
                    coordinates.append(coordinate)
            elif activity_type == "driving":
                total_driving_hours += activity["duration"]

    return coordinates
