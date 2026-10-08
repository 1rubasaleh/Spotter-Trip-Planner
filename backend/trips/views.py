
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import TripPlanSerializer
from .geocoding_service import geocode_location
from .route_service import get_route
from .route_coordinates import (
    get_fuel_stop_coordinates,
    get_rest_stop_coordinates,
)

from .trip_logic import (
    meters_to_miles,
    seconds_to_hours,
    calculate_daily_schedule,
    calculate_fuel_stops,
    create_eld_logs
)


@api_view(['POST'])
def plan_trip(request):

    serializer = TripPlanSerializer(data=request.data)

    if serializer.is_valid():

        validated_data = serializer.validated_data

        current_location = validated_data["current_location"]
        pickup = validated_data["pickup"]
        dropoff = validated_data["dropoff"]
        current_cycle_used = validated_data["current_cycle_used"]

        try:
            start = geocode_location(current_location)
            pickup_coords = geocode_location(pickup)
            dropoff_coords = geocode_location(dropoff)

        except Exception as error:
            return Response(
                {
                    "error": str(error)
                },
                status=503
            )

        if not start or not pickup_coords or not dropoff_coords:
            return Response(
                {
                    "error": "Could not find one or more locations."
                },
                status=400
            )

        try:
            route = get_route(
                start,
                pickup_coords,
                dropoff_coords
            )

        except Exception:
            return Response(
                {
                    "error": "Could not calculate the route."
                },
                status=503
            )

        if not route:
            return Response(
                {
                    "error": "Could not calculate the route."
                },
                status=400
            )

        distance_miles = meters_to_miles(
            route["distance"]
        )

        driving_hours = seconds_to_hours(
            route["duration"]
        )

        fuel_stops = calculate_fuel_stops(
            distance_miles
        )

        daily_schedule = calculate_daily_schedule(
            driving_hours,
            current_cycle_used,
            distance_miles
        )

        if isinstance(daily_schedule, dict) and "error" in daily_schedule:
            return Response(
                daily_schedule,
                status=400
            )

        eld_logs = create_eld_logs(
            daily_schedule
        )

        fuel_stop_coordinates = get_fuel_stop_coordinates(
            route["geometry"],
            distance_miles,
            fuel_stops,
        )

        rest_stop_coordinates = get_rest_stop_coordinates(
            route["geometry"],
            daily_schedule,
            driving_hours,
        )

        return Response({

            "distance_miles": distance_miles,

            "driving_hours": driving_hours,

            "fuel_stops": fuel_stops,

            "route_geometry": route["geometry"],

            "pickup_coordinate": [
                pickup_coords["latitude"],
                pickup_coords["longitude"],
            ],

            "fuel_stop_coordinates": fuel_stop_coordinates,

            "rest_stop_coordinates": rest_stop_coordinates,

            "daily_schedule": daily_schedule,

            "eld_logs": eld_logs
        })

    return Response(
        serializer.errors,
        status=400
    )

