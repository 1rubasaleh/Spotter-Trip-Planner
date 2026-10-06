# --------------------------------
# DISTANCE CONVERSION
# --------------------------------

# Convert distance from meters to miles
def meters_to_miles(meters):

    return meters / 1609.344


# --------------------------------
# TIME CONVERSION
# --------------------------------

# Convert time from seconds to hours
def seconds_to_hours(seconds):

    return seconds / 3600


# --------------------------------
# CYCLE HOURS
# --------------------------------

# Calculate remaining hours from
# the 70-hour / 8-day cycle
def calculate_cycle_hours_remaining(cycle_hours_used):

    remaining_hours = 70 - cycle_hours_used

    if remaining_hours < 0:
        remaining_hours = 0

    return remaining_hours


# --------------------------------
# FUEL STOPS
# --------------------------------

# The driver must fuel at least once
# every 1,000 miles.
def calculate_fuel_stops(distance_miles):

    fuel_stops = int(distance_miles // 1000)

    return fuel_stops


# --------------------------------
# PICKUP / DROPOFF
# --------------------------------

# Pickup and dropoff each take 1 hour
def calculate_loading_unloading_time():

    pickup_hours = 1
    dropoff_hours = 1

    return pickup_hours, dropoff_hours


# --------------------------------
# DAILY HOS SCHEDULE
# --------------------------------

def calculate_daily_schedule(
    driving_hours,
    current_cycle_used
):

    # Calculate how many cycle hours
    # are still available
    cycle_hours_remaining = calculate_cycle_hours_remaining(
        current_cycle_used
    )

    # Calculate pickup and dropoff durations
    pickup_hours, dropoff_hours = calculate_loading_unloading_time()

    # Minimum total cycle time required
    # pickup + driving + dropoff
    minimum_cycle_hours_needed = (
        pickup_hours
        + driving_hours
        + dropoff_hours
    )

    # Check if the remaining cycle hours
    # are enough for the trip
    if cycle_hours_remaining < minimum_cycle_hours_needed:

        return {
            "error": "Trip cannot be completed within the remaining cycle hours."
        }

    daily_schedules = []

    remaining_driving_hours = driving_hours

    pickup_completed = False

    # Continue creating days until
    # all driving is completed
    while remaining_driving_hours > 0:

        duty_hours_used = 0

        daily_driving_hours = 0

        driving_since_break = 0

        day_schedule = []

        # --------------------------------
        # PICKUP
        # --------------------------------

        # Pickup happens only on the first day
        if not pickup_completed:

            duty_hours_used += pickup_hours

            cycle_hours_remaining -= pickup_hours

            day_schedule.append({
                "type": "pickup",
                "duration": pickup_hours
            })

            pickup_completed = True

        # --------------------------------
        # DRIVING
        # --------------------------------

        while remaining_driving_hours > 0:

            # Maximum driving before
            # the required 30-minute break
            driving_until_break = (
                8 - driving_since_break
            )

            # Maximum driving allowed
            # by the 11-hour daily limit
            driving_until_daily_limit = (
                11 - daily_driving_hours
            )

            # Maximum time remaining
            # in the 14-hour duty window
            driving_until_duty_limit = (
                14 - duty_hours_used
            )

            # Select the smallest available limit
            available_driving_hours = min(
                driving_until_break,
                driving_until_daily_limit,
                driving_until_duty_limit,
                cycle_hours_remaining,
                remaining_driving_hours
            )

            # No driving time is available
            if available_driving_hours <= 0:

                if cycle_hours_remaining <= 0:

                    return {
                        "error": "Trip cannot be completed within the remaining cycle hours."
                    }

                break

            # Add driving time
            remaining_driving_hours -= (
                available_driving_hours
            )

            cycle_hours_remaining -= (
                available_driving_hours
            )

            daily_driving_hours += (
                available_driving_hours
            )

            driving_since_break += (
                available_driving_hours
            )

            duty_hours_used += (
                available_driving_hours
            )

            day_schedule.append({
                "type": "driving",
                "duration": available_driving_hours
            })

            # --------------------------------
            # 30-MINUTE BREAK
            # --------------------------------

            # After 8 hours of driving,
            # the driver needs a 30-minute break
            if (
                driving_since_break >= 8
                and remaining_driving_hours > 0
            ):

                break_hours = 0.5

                day_schedule.append({
                    "type": "break",
                    "duration": break_hours
                })

                # Break consumes time
                # inside the 14-hour duty window
                duty_hours_used += break_hours

                # Reset driving time
                # since the last break
                driving_since_break = 0

        # --------------------------------
        # DROPOFF
        # --------------------------------

        # Dropoff happens after all driving
        # has been completed
        if remaining_driving_hours <= 0:

            # Check the 14-hour duty window
            if (
                duty_hours_used
                + dropoff_hours
                > 14
            ):

                return {
                    "error": "Dropoff cannot be completed within the 14-hour duty window."
                }

            # Check remaining cycle hours
            if cycle_hours_remaining < dropoff_hours:

                return {
                    "error": "Trip cannot be completed within the remaining cycle hours."
                }

            day_schedule.append({
                "type": "dropoff",
                "duration": dropoff_hours
            })

            cycle_hours_remaining -= dropoff_hours

            duty_hours_used += dropoff_hours

        # --------------------------------
        # SAVE DAY
        # --------------------------------

        daily_schedules.append({
            "day": len(daily_schedules) + 1,
            "activities": day_schedule,
            "hours_used": duty_hours_used
        })

        # Stop once the trip is complete
        if remaining_driving_hours <= 0:

            break

    return daily_schedules


# --------------------------------
# ELD LOGS
# --------------------------------

# Convert the daily trip activities
# into ELD duty-status logs
def create_eld_logs(daily_schedules):

    eld_logs = []

    for day_schedule in daily_schedules:

        day = day_schedule["day"]

        activities = day_schedule["activities"]

        day_logs = []

        # Keep track of the current time
        # in the 24-hour day
        current_hour = 0

        # Convert every trip activity
        # into an ELD duty status
        for activity in activities:

            activity_type = activity["type"]

            duration = activity["duration"]

            # The activity starts at the current time
            start_hour = current_hour

            # The activity ends after its duration
            end_hour = current_hour + duration

            # Driving activity
            if activity_type == "driving":

                status = "Driving"

            # Pickup and dropoff are
            # on-duty but not driving
            elif activity_type in [
                "pickup",
                "dropoff"
            ]:

                status = "On Duty Not Driving"

            # 30-minute break
            elif activity_type == "break":

                status = "Off Duty"

            else:

                status = "Off Duty"

            # Add the activity to the ELD log
            day_logs.append({
                "status": status,
                "start_hour": start_hour,
                "end_hour": end_hour,
                "duration": duration
            })

            # Move the current time forward
            current_hour = end_hour

        # Remaining time in the 24-hour day
        # is considered off duty
        remaining_hours = 24 - current_hour

        if remaining_hours > 0:

            day_logs.append({
                "status": "Off Duty",
                "start_hour": current_hour,
                "end_hour": 24,
                "duration": remaining_hours
            })

        eld_logs.append({
            "day": day,
            "logs": day_logs
        })

    return eld_logs