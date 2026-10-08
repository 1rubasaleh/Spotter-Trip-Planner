import axios from "axios";

const TRIP_PLAN_ENDPOINT = "/api/trips/plan/";

export async function planTrip({
  currentLocation,
  pickupLocation,
  dropoffLocation,
  currentCycleUsed,
}) {
  const response = await axios.post(TRIP_PLAN_ENDPOINT, {
    current_location: currentLocation,
    pickup: pickupLocation,
    dropoff: dropoffLocation,
    current_cycle_used: currentCycleUsed,
  });

  return response.data;
}
