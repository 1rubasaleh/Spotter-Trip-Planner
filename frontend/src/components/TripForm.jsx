const fields = [
  {
    id: "current-location",
    label: "Current location",
    placeholder: "Enter a city or address",
    marker: "current",
  },
  {
    id: "pickup-location",
    label: "Pickup location",
    placeholder: "Enter pickup address",
    marker: "pickup",
  },
  {
    id: "dropoff-location",
    label: "Dropoff location",
    placeholder: "Enter dropoff address",
    marker: "dropoff",
  },
];

function LocationMarker({ type }) {
  if (type === "current") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="size-[18px]"
      >
        <circle
          cx="10"
          cy="10"
          r="5.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="10" r="2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="size-[18px]"
    >
      <path
        d="M16 8.4c0 4.3-6 9.1-6 9.1S4 12.7 4 8.4a6 6 0 1 1 12 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TripForm({ onSubmit, isLoading, error }) {
  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const values = new FormData(form);

    onSubmit({
      currentLocation: values.get("current-location"),
      pickupLocation: values.get("pickup-location"),
      dropoffLocation: values.get("dropoff-location"),
      currentCycleUsed: Number(values.get("cycle-used")),
    });
  }

  return (
    <section
      className="rounded-lg border border-[#e2e8e1] bg-white px-5 py-6 sm:px-6"
      aria-labelledby="trip-details-title"
    >
      <div className="mb-6 border-b border-[#edf0ec] pb-5">
        <h2
          id="trip-details-title"
          className="text-base font-semibold text-[#26352b]"
        >
          Trip details
        </h2>

        <p className="mt-1 text-sm text-[#78837a]">
          Enter your route information below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {fields.map((field, index) => (
          <div key={field.id}>
            <label
              htmlFor={field.id}
              className="mb-2 block text-[13px] font-medium text-[#344239]"
            >
              {field.label}
            </label>

            <div className="relative">
              <span
                className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  field.marker === "current"
                    ? "text-[#52795d]"
                    : field.marker === "pickup"
                      ? "text-[#c48b40]"
                      : "text-[#ba655a]"
                }`}
              >
                <LocationMarker type={field.marker} />
              </span>

              <input
                id={field.id}
                name={field.id}
                type="text"
                placeholder={field.placeholder}
                required
                autoComplete="off"
                className="h-11 w-full rounded-md border border-[#dce3dc] bg-white pl-11 pr-3 text-sm text-[#26352b] outline-none transition placeholder:text-[#a0aaa1] focus:border-[#557a61] focus:ring-2 focus:ring-[#557a61]/15"
              />
            </div>

            {index < fields.length - 1 && (
              <div
                className="ml-[21px] mt-1 h-3 border-l border-dashed border-[#d2dbd2]"
                aria-hidden="true"
              />
            )}
          </div>
        ))}

        <div className="pt-1">
          <label
            htmlFor="cycle-used"
            className="mb-2 block text-[13px] font-medium text-[#344239]"
          >
            Current cycle used
          </label>

          <div className="relative">
            <input
              id="cycle-used"
              name="cycle-used"
              type="number"
              min="0"
              step="any"
              placeholder="e.g. 12.5"
              required
              autoComplete="off"
              className="h-11 w-full rounded-md border border-[#dce3dc] bg-white px-3.5 pr-14 text-sm text-[#26352b] outline-none transition placeholder:text-[#a0aaa1] focus:border-[#557a61] focus:ring-2 focus:ring-[#557a61]/15"
            />

            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#879188]">
              hours
            </span>
          </div>

          <p className="mt-1.5 text-xs text-[#879188]">
            Enter the used hours (e.g., 1.5 for 1h 30m).
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-[#edcfcb] bg-[#fbf2f1] px-3 py-2.5 text-sm text-[#8f4138]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#244b37] px-4 text-sm font-semibold text-white transition hover:bg-[#1c3c2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#557a61]"
        >
          {isLoading ? "Planning trip..." : "Plan trip"}

          {isLoading ? (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="size-4"
            >
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </section>
  );
}

export default TripForm;
