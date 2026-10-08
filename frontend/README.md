# Spotter Trip Planner

A full-stack trip planning application built with React and Django.

The user can enter a current location, pickup location, dropoff location, and current cycle hours. The application calculates the route and creates a driving schedule based on the required HOS rules.

## Features

- Enter trip locations
- Enter current cycle hours
- View the route on an interactive map
- Show pickup and dropoff locations
- Calculate fuel stops when needed
- Calculate driving, break, and rest periods
- Generate daily ELD logs
- Support trips that take more than one day
- Check the remaining cycle hours

## HOS Rules

The project uses these rules:

- 11 hours maximum driving time
- 14 hours maximum duty window
- 30-minute break after 8 hours of driving
- 10 hours rest between driving days
- 70 hours / 8-day cycle
- Fuel stop every 1,000 miles
- 1 hour for pickup
- 1 hour for dropoff

## Technologies

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Leaflet
- Leaflet

### Backend

- Python
- Django
- Django REST Framework
- Gunicorn

### APIs

- OpenStreetMap Nominatim
- OSRM

## How it works

1. The user enters the trip details.
2. The frontend sends the data to the Django backend.
3. The backend finds the locations and calculates the route.
4. The trip distance and driving time are calculated.
5. The HOS rules are applied to create the daily schedule.
6. ELD logs are generated and returned to the frontend.
7. The frontend displays the route and results.

## Project Structure

```text
Spotter-Trip-Planner/
│
├── backend/
│   ├── config/
│   └── trips/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── public/
│
└── README.md
```

## Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Main Endpoint

```text
POST /api/trips/plan/
```

Example request:

```json
{
  "current_location": "Chicago, IL",
  "pickup": "Indianapolis, IN",
  "dropoff": "Columbus, OH",
  "current_cycle_used": 10
}
```

## Deployment

Frontend: Vercel

Backend: Render
