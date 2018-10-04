from cStringIO import StringIO

from django.utils import timezone
from lxml import etree
from lxml.etree import CDATA
from rest_framework import generics, serializers, renderers, authentication, permissions

from mjp.models import Job, Contract, JobStatus, User

# Fri, 10 Dec 2008 22:49:39 GMT
INDEED_DATE_FORMAT = "%a, %d %b %Y %H:%M:%S %Z"


class IndeedJobSerializer(serializers.ModelSerializer):
    referencenumber = serializers.CharField(source='id')
    date = serializers.DateTimeField(format=INDEED_DATE_FORMAT, source='created')
    url = serializers.SerializerMethodField()
    company = serializers.CharField(source='location.business.name')
    sourcename = serializers.CharField(source='location.business.name')
    city = serializers.CharField(source='location.city')
    state = serializers.CharField(source='location.region')
    country = serializers.CharField(source='location.country')
    postalcode = serializers.CharField(source='location.postcode')
    email = serializers.EmailField(source='location.email')
    jobtype = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    def get_url(self, job):
        return self.context['request'].build_absolute_uri(job.get_absolute_url())

    def get_jobtype(self, job):
        if job.contract == Contract.objects.get(name=Contract.TEMPORARY):
            return 'parttime'
        return 'fulltime'

    def get_category(self, job):
        return job.sector.name

    class Meta(object):
        model = Job
        fields = (
            'title',
            'date',
            'referencenumber',
            'url',
            'company',
            'sourcename',
            'city',
            'state',
            'country',
            'postalcode',
            'email',
            'description',
            'jobtype',
            'category',
       )


class IndeedXMLRenderer(renderers.BaseRenderer):
    media_type = 'application/xml'
    format = 'xml'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if renderer_context['response'].status_code != 200:
            return ''
        root = etree.Element("source")
        etree.SubElement(root, "publisher").text = 'My Job Pitch'
        etree.SubElement(root, "publisherurl").text = renderer_context['request'].build_absolute_uri()
        etree.SubElement(root, "lastbuilddate").text = timezone.now().strftime(INDEED_DATE_FORMAT)
        for job_data in data:
            job = etree.SubElement(root, "job")
            for k, v in job_data.items():
                etree.SubElement(job, k).text = CDATA(v)
        f = StringIO()
        etree.ElementTree(root).write(f, encoding='utf-8', xml_declaration=True, pretty_print=True)
        return f.getvalue()


class IndeedFeedPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user == User.objects.get(email='feed@indeed.com'):
            return True


class IndeedFeedView(generics.ListAPIView):
    serializer_class = IndeedJobSerializer
    renderer_classes = (IndeedXMLRenderer,)
    queryset = Job.objects.all()
    authentication_classes = (authentication.BasicAuthentication,)
    permission_classes = (permissions.IsAuthenticated, IndeedFeedPermission)

    def get_queryset(self):
        return super(IndeedFeedView, self).get_queryset().filter(
            status__name=JobStatus.OPEN,
        )
