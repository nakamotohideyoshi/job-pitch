from rest_framework import generics
from rest_framework.throttling import AnonRateThrottle

from mjp.models import Job, JobStatus, JobSeeker
from mjp.serializers.public import (
    PublicJobListingSerializer,
    PublicJobSeekerListingSerializerV1,
    PublicJobSeekerListingSerializer,
)


class PublicListingThrottle(AnonRateThrottle):
    rate = '1/s'


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
