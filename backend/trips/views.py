from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import TripPlanSerializer
from .geocoding_service import geocode_location
from .route_service import get_route

# Functions used to calculate route and HOS trip logic
from .trip_logic import (
    meters_to_miles,
    seconds_to_hours,
    calculate_daily_schedule,
    calculate_fuel_stops,
    create_eld_logs
)


@api_view(['POST'])
def plan_trip(request):

    # --------------------------------
    # VALIDATE INPUT
    # --------------------------------

    # Validate the data sent by the frontend
    serializer = TripPlanSerializer(data=request.data)

    if serializer.is_valid():

        # Get the validated input data
        validated_data = serializer.validated_data

        current_location = validated_data["current_location"]
        pickup = validated_data["pickup"]
        dropoff = validated_data["dropoff"]
        current_cycle_used = validated_data["current_cycle_used"]

        # --------------------------------
        # GEOCODING
        # --------------------------------

        # Convert current location into coordinates
        start = geocode_location(current_location)

        # Convert pickup location into coordinates
        pickup_coords = geocode_location(pickup)

        # Convert dropoff location into coordinates
        dropoff_coords = geocode_location(dropoff)

        # Check that all locations were found
        if not start or not pickup_coords or not dropoff_coords:

            return Response(
                {
                    "error": "Could not find one or more locations."
                },
                status=400
            )

        # --------------------------------
        # ROUTE
        # --------------------------------

        # Get the route:
        # Current Location -> Pickup -> Dropoff
        route = get_route(
            start,
            pickup_coords,
            dropoff_coords
        )

        # Check if the routing service failed
        if not route:

            return Response(
                {
                    "error": "Could not calculate the route."
                },
                status=400
            )

        # --------------------------------
        # DISTANCE AND TIME
        # --------------------------------

        # Convert distance from meters to miles
        distance_miles = meters_to_miles(
            route["distance"]
        )

        # Convert duration from seconds to hours
        driving_hours = seconds_to_hours(
            route["duration"]
        )

        # --------------------------------
        # FUEL STOPS
        # --------------------------------

        # Calculate how many fuel stops are required
        # based on the 1,000-mile rule
        fuel_stops = calculate_fuel_stops(
            distance_miles
        )

        # --------------------------------
        # DAILY HOS SCHEDULE
        # --------------------------------

        # Calculate the driver's daily schedule
        # according to the HOS rules
        daily_schedule = calculate_daily_schedule(
            driving_hours,
            current_cycle_used
        )

        # If the trip cannot be completed,
        # return the error to the frontend
        if isinstance(daily_schedule, dict) and "error" in daily_schedule:

            return Response(
                daily_schedule,
                status=400
            )

        # --------------------------------
        # ELD LOGS
        # --------------------------------

        # Convert the daily schedule into
        # ELD duty-status logs
        eld_logs = create_eld_logs(
            daily_schedule
        )

        # --------------------------------
        # FINAL RESPONSE
        # --------------------------------

        return Response({

            # Total route distance in miles
            "distance_miles": distance_miles,

            # Total driving time in hours
            "driving_hours": driving_hours,

            # Number of required fuel stops
            "fuel_stops": fuel_stops,

            # Route geometry used by React
            # to draw the route on the map
            "route_geometry": route["geometry"],

            # Daily HOS schedule
            "daily_schedule": daily_schedule,

            # ELD logs for each day
            "eld_logs": eld_logs
        })

    # --------------------------------
    # VALIDATION ERRORS
    # --------------------------------

    return Response(
        serializer.errors,
        status=400
    )