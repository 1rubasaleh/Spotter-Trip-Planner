from django.test import TestCase
from .route_coordinates import (
    get_fuel_stop_coordinates,
    get_rest_stop_coordinates,
)


class RouteCoordinateTests(TestCase):
    def setUp(self):
        self.route_geometry = {
            "type": "LineString",
            "coordinates": [
                [-122.0, 37.0],
                [-121.0, 37.0],
                [-120.0, 37.0],
            ],
        }

    def test_fuel_coordinates_follow_each_thousand_mile_threshold(self):
        coordinates = get_fuel_stop_coordinates(
            self.route_geometry,
            2500,
            2,
        )

        self.assertEqual(len(coordinates), 2)
        self.assertLess(coordinates[0][1], coordinates[1][1])
        self.assertLess(coordinates[1][1], -120.0)

    def test_rest_coordinates_follow_scheduled_driving_progress(self):
        daily_schedule = [
            {
                "activities": [
                    {"type": "driving", "duration": 8},
                    {"type": "break", "duration": 0.5},
                    {"type": "driving", "duration": 2},
                    {"type": "sleep", "duration": 10},
                ],
            },
        ]

        coordinates = get_rest_stop_coordinates(
            self.route_geometry,
            daily_schedule,
            10,
        )

        self.assertEqual(len(coordinates), 2)
        self.assertLess(coordinates[0][1], coordinates[1][1])
        self.assertEqual(coordinates[1], [37.0, -120.0])
