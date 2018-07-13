from rest_framework import generics
from rest_framework.throttling import AnonRateThrottle

from mjp.models import Job, JobStatus, JobSeeker, Location
from mjp.serializers.public import (
    PublicJobListingSerializer,
    PublicJobSeekerListingSerializerV1,
    PublicJobSeekerListingSerializer,
    PublicLocationListingSerializer)


class PublicListingThrottle(AnonRateThrottle):
    rate = '1/s'


class PublicLocationListing(generics.RetrieveAPIView):
    queryset = Location.objects.filter()
    serializer_class = PublicLocationListingSerializer
    throttle_classes = (PublicListingThrottle,)


class PublicJobListing(generics.RetrieveAPIView):
    queryset = Job.objects.filter(status__name=JobStatus.OPEN)
    serializer_class = PublicJobListingSerializer
    throttle_classes = (PublicListingThrottle,)


class PublicJobSeekerListing(generics.RetrieveAPIView):
    queryset = JobSeeker.objects.filter(active=True)
    throttle_classes = (PublicListingThrottle,)

    def get_serializer_class(self):
        try:
            version = int(self.request.version)
        except (TypeError, ValueError):
            version = 1

        if version > 3:
            return PublicJobSeekerListingSerializer
        return PublicJobSeekerListingSerializerV1
