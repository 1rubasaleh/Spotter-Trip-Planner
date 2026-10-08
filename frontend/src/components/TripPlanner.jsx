import { useState } from "react";
import Header from "./Header.jsx";
import TripForm from "./TripForm.jsx";
import TripMap from "./TripMap.jsx";
import TripResults from "./TripResults.jsx";
import { planTrip } from "../services/tripApi.js";

function getErrorMessage(error) {
  const responseData = error.response?.data;

  if (typeof responseData?.error === "string") return responseData.error;

  if (responseData && typeof responseData === "object") {
    return Object.entries(responseData)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(" ")
          : String(messages);
        return `${field.replaceAll("_", " ")}: ${message}`;
      })
      .join(" ");
  }

  if (error.response)
    return `Trip request failed (HTTP ${error.response.status}).`;
  return "Could not reach the trip-planning API. Check that Django is running and try again.";
}

function TripPlanner() {
  const [result, setResult] = useState(null);
  const [locations, setLocations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePlanTrip(formValues) {
    setIsLoading(true);
    setError("");
    setResult(null);
    setLocations(null);

    try {
      const tripResult = await planTrip(formValues);
      setResult(tripResult);
      setLocations(formValues);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#202721]">
      <Header />
      <main className="mx-auto max-w-[1440px] px-5 pb-8 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#708174]">
            Trip planner
          </p>
          <h1 className="font-display text-3xl leading-tight text-[#202721] sm:text-4xl">
            Where are you headed?
          </h1>
          <p className="mt-2 text-sm text-[#69756c]">
            Add your trip details to get started.
          </p>
        </div>

        <div className="grid min-h-[610px] grid-cols-1 gap-5 lg:grid-cols-[minmax(310px,390px)_minmax(0,1fr)]">
          <TripForm
            onSubmit={handlePlanTrip}
            isLoading={isLoading}
            error={error}
          />
          <TripMap
            routeGeometry={result?.route_geometry}
            pickupCoordinate={result?.pickup_coordinate}
            fuelStopCoordinates={result?.fuel_stop_coordinates}
            restStopCoordinates={result?.rest_stop_coordinates}
          />
        </div>
        {result && locations && (
          <TripResults result={result} locations={locations} />
        )}
      </main>
    </div>
  );
}

export default TripPlanner;
