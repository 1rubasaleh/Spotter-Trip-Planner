from rest_framework import serializers


class TripPlanSerializer(serializers.Serializer):
    current_location = serializers.CharField()
    pickup = serializers.CharField()
    dropoff = serializers.CharField()
    current_cycle_used = serializers.FloatField()