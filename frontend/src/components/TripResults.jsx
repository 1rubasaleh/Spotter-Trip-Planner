const activityLabels = {
  pickup: "Pickup",
  driving: "Driving",
  break: "Break",
  dropoff: "Dropoff",
};

const statusColors = {
  Driving: "bg-[#4d7959]",
  "On Duty Not Driving": "bg-[#c28a42]",
  "Off Duty": "bg-[#aab6ac]",
};

function formatHours(value) {
  return `${Number(value).toFixed(1)} h`;
}

function formatClock(hour) {
  const totalMinutes = Math.round(Number(hour) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function TripResults({ result, locations }) {
  if (!result) return null;

  return (
    <section
      className="mt-6 space-y-5"
      aria-label="Trip plan results"
      aria-live="polite"
    >
      <section aria-labelledby="trip-summary-title">
        <h2
          id="trip-summary-title"
          className="mb-3 text-base font-semibold text-[#26352b]"
        >
          Trip summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryValue
            label="Route distance"
            value={`${Number(result.distance_miles).toFixed(1)} mi`}
          />
          <SummaryValue
            label="Driving time"
            value={formatHours(result.driving_hours)}
          />
          <SummaryValue label="Fuel stops required" value={result.fuel_stops} />
        </div>
      </section>

      <section
        className="rounded-lg border border-[#e2e8e1] bg-white p-5 sm:p-6"
        aria-labelledby="route-stops-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="route-stops-title"
              className="text-base font-semibold text-[#26352b]"
            >
              Route stops
            </h2>
            <p className="mt-1 text-sm text-[#78837a]">
              Trip locations and fuel-stop count from the plan.
            </p>
          </div>
          <span className="rounded-md bg-[#f1f5f0] px-3 py-1.5 text-sm font-medium text-[#344e3b]">
            {result.fuel_stops} fuel stops
          </span>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Current location", locations.currentLocation],
            ["Pickup", locations.pickupLocation],
            ["Dropoff", locations.dropoffLocation],
          ].map(([label, value], index) => (
            <li
              key={label}
              className="flex min-w-0 items-start gap-3 rounded-md border border-[#edf0ec] p-3"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#edf3ed] text-xs font-semibold text-[#45634b]">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-[#78837a]">{label}</span>
                <span className="mt-1 block break-words text-sm font-medium text-[#344239]">
                  {value}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-[#78837a]">
          The API returns the fuel-stop count, but not individual fuel-stop
          locations.
        </p>
      </section>

      <section
        className="rounded-lg border border-[#e2e8e1] bg-white p-5 sm:p-6"
        aria-labelledby="daily-schedule-title"
      >
        <div className="mb-4">
          <h2
            id="daily-schedule-title"
            className="text-base font-semibold text-[#26352b]"
          >
            Daily schedule
          </h2>
          <p className="mt-1 text-sm text-[#78837a]">
            Activities and hours from the API response.
          </p>
        </div>
        <div className="divide-y divide-[#edf0ec]">
          {result.daily_schedule.map((day) => (
            <div
              key={day.day}
              className="grid gap-2 py-4 sm:grid-cols-[100px_1fr_auto] sm:items-start"
            >
              <h3 className="text-sm font-semibold text-[#344239]">
                Day {day.day}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {day.activities.map((activity, index) => (
                  <li
                    key={`${activity.type}-${index}`}
                    className="rounded-md bg-[#f4f6f3] px-2.5 py-1.5 text-xs text-[#526057]"
                  >
                    {activityLabels[activity.type] ?? activity.type} ·{" "}
                    {formatHours(activity.duration)}
                  </li>
                ))}
              </ul>
              <span className="text-sm text-[#69756c]">
                {formatHours(day.hours_used)} used
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="rounded-lg border border-[#e2e8e1] bg-white p-5 sm:p-6"
        aria-labelledby="hos-logs-title"
      >
        <div className="mb-5">
          <h2
            id="hos-logs-title"
            className="text-base font-semibold text-[#26352b]"
          >
            Daily log sheets
          </h2>
          <p className="mt-1 text-sm text-[#78837a]">
            Duty-status entries and 24-hour HOS timelines from the ELD logs.
          </p>
        </div>
        <div className="space-y-5">
          {result.eld_logs.map((day) => (
            <div
              key={day.day}
              className="border-t border-[#edf0ec] pt-4 first:border-0 first:pt-0"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#344239]">
                  Day {day.day}
                </h3>
                <div className="flex flex-wrap gap-3 text-xs text-[#69756c]">
                  {Object.entries(statusColors).map(([status, color]) => (
                    <span
                      key={status}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span className={`size-2 rounded-sm ${color}`} />
                      {status}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mb-1 text-xs font-medium text-[#78837a]">
                HOS log chart
              </p>
              <div
                className="relative h-8 overflow-hidden rounded-sm bg-[#f0f3ef]"
                aria-label={`Day ${day.day} HOS log chart`}
              >
                {day.logs.map((log, index) => (
                  <span
                    key={`${log.status}-${log.start_hour}-${index}`}
                    title={`${log.status}: ${formatClock(log.start_hour)}–${formatClock(log.end_hour)} (${formatHours(log.duration)})`}
                    className={`absolute inset-y-0 border-r border-white/70 ${statusColors[log.status] ?? "bg-[#aab6ac]"}`}
                    style={{
                      left: `${(Number(log.start_hour) / 24) * 100}%`,
                      width: `${(Number(log.duration) / 24) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[#879188]">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-xs">
                  <thead className="text-[#78837a]">
                    <tr>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Start</th>
                      <th className="pb-2 font-medium">End</th>
                      <th className="pb-2 text-right font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f2ef] text-[#435147]">
                    {day.logs.map((log, index) => (
                      <tr key={`${log.status}-${log.start_hour}-${index}`}>
                        <td className="py-2">{log.status}</td>
                        <td className="py-2">{formatClock(log.start_hour)}</td>
                        <td className="py-2">{formatClock(log.end_hour)}</td>
                        <td className="py-2 text-right">
                          {formatHours(log.duration)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function SummaryValue({ label, value }) {
  return (
    <div className="rounded-lg border border-[#e2e8e1] bg-white px-5 py-4">
      <p className="text-xs font-medium text-[#78837a]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#26352b]">{value}</p>
    </div>
  );
}

export default TripResults;
