from model_mommy import mommy
from rest_framework.reverse import reverse

from mjp.models import Business, BusinessUser, TokenStore, Location, Job, Sector, Contract, Hours, JobStatus
from mjp.views.tests import AuthenticatedAPITestCase


class AuthenticatedNewRecruiterAPITestCase(AuthenticatedAPITestCase):
    def test_create_first_business(self):
        response = self.client.post(reverse('user-business-list'), {"name": "A business"})
        self.assertEqual(response.status_code, 201)
        data = response.json()
        business = Business.objects.get(pk=data['id'])
        self.assertDictEqual(data, {
            u"id": business.pk,
            u"name": u"A business",
            u"images": [],
            u"locations": [],
            u"tokens": 100,
            u"users": [self.user.pk],
            u"created": business.created.isoformat().split('+')[0] + u'Z',
            u"updated": business.updated.isoformat().split('+')[0] + u'Z',
        })


class AuthenticatedRecruiterAPITestCase(AuthenticatedAPITestCase):
    def setUp(self):
        super(AuthenticatedRecruiterAPITestCase, self).setUp()
        self.token_store = mommy.make(TokenStore, tokens=20)
        self.business = mommy.make(Business, token_store=self.token_store)
        self.business_user = mommy.make(BusinessUser, business=self.business, user=self.user)

    def process_businesses(self, businesses):
        return sorted([self.process_business(business) for business in businesses], key=lambda b: b['id'])

    def process_business(self, business):
        business['locations'].sort()
        return business

    def get_business_data(self, business, locations=None, tokens=20, name=None, updated=None):
        return self.process_business({
            u"id": business.id,
            u"name": business.name if name is None else name,
            u"locations": [] if locations is None else sorted(locations),
            u"images": [],
            u"tokens": tokens,
            u"users": [self.user.id],
            u"created": business.created.isoformat().split('+')[0] + u'Z',
            u"updated": (business.updated if updated is None else updated).isoformat().split('+')[0] + u'Z',
        })

    def process_locations(self, locations):
        return sorted([self.process_location(location) for location in locations], key=lambda l: l['id'])

    def process_location(self, location):
        location['jobs'].sort()
        location['business_data'] = self.process_business(location['business_data'])
        return location

    def get_location_data(self, location, locations=None, jobs=None, name=None, updated=None):
        return self.process_location({
            u'id': location.pk,
            u'name': location.name if name is None else name,
            u'description': location.description,
            u'place_id': location.place_id,
            u'place_name': location.place_name,
            u'email': location.email,
            u'email_public': False,
            u'telephone': location.telephone,
            u'telephone_public': False,
            u'mobile': location.mobile,
            u'mobile_public': False,
            u'latitude': location.latlng.y,
            u'longitude': location.latlng.x,
            u'address': location.address,
            u'postcode_lookup': location.postcode_lookup,
            u'active_job_count': 0,
            u'jobs': [] if jobs is None else sorted(jobs),
            u'images': [],
            u'business': location.business_id,
            u'business_data': self.get_business_data(location.business, locations=locations),
            u"created": location.created.isoformat().split(u'+')[0] + u'Z',
            u"updated": (location.updated if updated is None else updated).isoformat().split(u'+')[0] + u'Z',
        })

    def process_jobs(self, jobs):
        return sorted([self.process_job(job) for job in jobs], key=lambda b: b['id'])

    def process_job(self, job):
        job['location_data'] = self.process_location(job['location_data'])
        return job

    def get_job_data(self, job, locations=None, jobs=None, title=None, updated=None):
        return self.process_job({
            u'id': job.pk,
            u'title': job.title if title is None else title,
            u'contract': job.contract.pk,
            u'hours': job.hours.pk,
            u'sector': job.sector.pk,
            u'status': job.status.pk,
            u'description': job.description,
            u'images': [],
            u'location': job.location_id,
            u'location_data': self.get_location_data(job.location, locations=locations, jobs=jobs),
            u"created": job.created.isoformat().split(u'+')[0] + u'Z',
            u"updated": (job.updated if updated is None else updated).isoformat().split(u'+')[0] + u'Z',
        })


class TestUserBusinessViewSet(AuthenticatedRecruiterAPITestCase):
    maxDiff = None

    def setUp(self):
        super(TestUserBusinessViewSet, self).setUp()
        self.other_businesses = mommy.make(Business, _quantity=3)

    def test_list(self):
        self.assertListEqual(
            self.client.get(reverse('user-business-list')).json(),
            [self.get_business_data(self.business)],
        )

    def test_retrieve(self):
        self.assertDictEqual(
            self.client.get(reverse('user-business-detail', kwargs={'pk': self.business.pk})).json(),
            self.get_business_data(self.business),
        )

    def test_retrieve_wrong_owner(self):
        self.assertEqual(
            self.client.get(reverse('user-business-detail', kwargs={'pk': self.other_businesses[0].pk})).status_code,
            404,
        )

    def test_create(self):
        self.user.can_create_businesses = True
        self.user.save()
        response = self._create_business()
        self.assertEqual(response.status_code, 201)
        data = response.json()
        business = Business.objects.get(pk=data['id'])
        self.assertDictEqual(data, self.get_business_data(business, tokens=100))

    def test_create_as_location_user(self):
        self.user.can_create_businesses = True
        self.user.save()
        location = mommy.make(Location, business=self.business)
        location.business_users.add(self.business_user)
        response = self._create_business()
        self.assertEqual(response.status_code, 201)
        data = response.json()
        business = Business.objects.get(pk=data['id'])
        self.assertDictEqual(data, self.get_business_data(business, tokens=100))

    def test_create_not_allowed(self):
        self.assertEqual(self._create_business().status_code, 403)

    def _create_business(self):
        return self.client.post(reverse('user-business-list'), {"name": "A business"})

    def test_update(self):
        response = self.client.patch(reverse('user-business-detail', kwargs={'pk': self.business.pk}), {
            'name': "some name",
        })
        business = Business.objects.get(pk=self.business.pk)
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            response.json(),
            self.get_business_data(self.business, name='some name', updated=business.updated)
        )

    def test_update_wrong_owner(self):
        response = self.client.patch(reverse('user-business-detail', kwargs={'pk': self.other_businesses[0].pk}), {
            'name': "some name",
        })
        self.assertEqual(response.status_code, 404)

    def test_update_as_location_user(self):
        location = mommy.make(Location, business=self.business)
        location.business_users.add(self.business_user)
        response = self.client.patch(reverse('user-business-detail', kwargs={'pk': self.business.pk}), {
            'name': "some name",
        })
        self.assertEqual(response.status_code, 403)

    def test_delete(self):
        self.user.can_create_businesses = True
        self.user.save()
        response = self.client.delete(reverse('user-business-detail', kwargs={'pk': self.business.pk}))
        self.assertEqual(response.status_code, 204)
        self.assertQuerysetEqual(Business.objects.filter(pk=self.business.pk), Business.objects.none())

    def test_delete_wrong_owner(self):
        self.user.can_create_businesses = True
        self.user.save()
        response = self.client.delete(reverse('user-business-detail', kwargs={'pk': self.other_businesses[0].pk}))
        self.assertEqual(response.status_code, 404)

    def test_delete_not_allowed(self):
        response = self.client.delete(reverse('user-business-detail', kwargs={'pk': self.business.pk}))
        self.assertEqual(response.status_code, 403)

    def test_delete_as_location_user(self):
        self.user.can_create_businesses = True
        self.user.save()
        location = mommy.make(Location, business=self.business)
        location.business_users.add(self.business_user)
        response = self.client.delete(reverse('user-business-detail', kwargs={'pk': self.business.pk}))
        self.assertEqual(response.status_code, 403)


class TestUserLocationViewSet(AuthenticatedRecruiterAPITestCase):
    def setUp(self):
        super(TestUserLocationViewSet, self).setUp()
        self.location = mommy.make(Location, business=self.business)
        self.location_2 = mommy.make(Location, business=self.business)
        self.other_business = mommy.make(Business)
        self.other_locations = mommy.make(Location, _quantity=3, business=self.other_business)

    def _create_location(self, business, name="Some location", latitude=56.5, longitude=3.4, description='A location',
                         place_name="google says it's here", **kwargs):
        data = {
            "business": business.pk,
            "name": name,
            "latitude": latitude,
            "longitude": longitude,
            "description": description,
            "place_name": place_name,
        }
        data.update(kwargs)
        return self.client.post(reverse('user-location-list'), data)

    def test_list(self):
        self.assertListEqual(
            self.process_locations(self.client.get(reverse('user-location-list')).json()),
            self.process_locations([
                self.get_location_data(self.location, locations=[self.location.pk, self.location_2.pk]),
                self.get_location_data(self.location_2, locations=[self.location.pk, self.location_2.pk]),
            ]),
        )

    def test_retrieve(self):
        self.assertDictEqual(
            self.process_location(
                self.client.get(reverse('user-location-detail', kwargs={'pk': self.location.pk})).json(),
            ),
            self.get_location_data(self.location, locations=[self.location.pk, self.location_2.pk]),
        )

    def test_retrieve_wrong_owner(self):
        self.assertEqual(
            self.client.get(reverse('user-location-detail', kwargs={'pk': self.other_locations[0].pk})).status_code,
            404,
        )

    def test_create(self):
        response = self._create_location(business=self.business)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        location = Location.objects.get(pk=data['id'])
        self.assertDictEqual(
            self.process_location(data),
            self.get_location_data(location, locations=[self.location.pk, self.location_2.pk, data['id']]),
        )

    def test_create_wrong_business_owner(self):
        self.assertEqual(self._create_location(business=self.other_business).status_code, 403)

    def test_create_as_location_user(self):
        self.location.business_users.add(self.business_user)
        self.assertEqual(self._create_location(business=self.business).status_code, 403)

    def test_update(self):
        response = self.client.patch(reverse('user-location-detail', kwargs={'pk': self.location.pk}), {
            'name': "some name",
        })
        self.assertEqual(response.status_code, 200)
        location = Location.objects.get(pk=self.location.pk)
        self.assertDictEqual(
            self.process_location(response.json()),
            self.get_location_data(self.location, name='some name', updated=location.updated, locations=[
                self.location.pk,
                self.location_2.pk,
            ])
        )

    def test_update_wrong_business_owner(self):
        response = self.client.patch(reverse('user-location-detail', kwargs={'pk': self.other_locations[0].pk}), {
            'name': "some name",
        })
        self.assertEqual(response.status_code, 404)

    def test_update_as_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.patch(reverse('user-location-detail', kwargs={'pk': self.location.pk}), {
            'name': "some name",
        })
        self.assertEqual(response.status_code, 200)
        location = Location.objects.get(pk=self.location.pk)
        self.assertDictEqual(
            self.process_location(response.json()),
            self.get_location_data(self.location, name='some name', updated=location.updated, locations=[
                self.location.pk,
                self.location_2.pk,
            ])
        )

    def test_update_as_wrong_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.patch(reverse('user-location-detail', kwargs={'pk': self.location_2.pk}), {
            'name': "some name",
        })
        self.assertEqual(response.status_code, 404)

    def test_delete(self):
        response = self.client.delete(reverse('user-location-detail', kwargs={'pk': self.location.pk}))
        self.assertEqual(response.status_code, 204)
        self.assertQuerysetEqual(Location.objects.filter(pk=self.location.pk), Business.objects.none())

    def test_delete_wrong_business_owner(self):
        response = self.client.delete(reverse('user-location-detail', kwargs={'pk': self.other_locations[0].pk}))
        self.assertEqual(response.status_code, 404)

    def test_delete_as_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.delete(reverse('user-location-detail', kwargs={'pk': self.location.pk}))
        self.assertEqual(response.status_code, 403)

    def test_delete_as_wrong_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.delete(reverse('user-location-detail', kwargs={'pk': self.location_2.pk}))
        self.assertEqual(response.status_code, 404)


class TestUserJobViewSet(AuthenticatedRecruiterAPITestCase):
    def setUp(self):
        super(TestUserJobViewSet, self).setUp()
        self.location, self.location_2 = mommy.make(Location, _quantity=2, business=self.business)
        self.sector = mommy.make(Sector)
        self.contract = mommy.make(Contract)
        self.hours = mommy.make(Hours)
        self.status = mommy.make(JobStatus)
        self.job, self.job_2 = mommy.make(
            Job,
            _quantity=2,
            location=self.location,
            sector=self.sector,
            contract=self.contract,
            hours=self.hours,
        )
        self.other_job = mommy.make(
            Job,
            location=self.location_2,
            sector=self.sector,
            contract=self.contract,
            hours=self.hours,
        )
        self.other_business = mommy.make(Business)
        self.other_locations = mommy.make(Location, _quantity=3, business=self.other_business)
        self.other_jobs = mommy.make(Job, _quantity=3, location=self.other_locations[0])

    def _create_job(self, location, title="some job", description="do some work", **kwargs):
        data = {
            "title": title,
            "description": description,
            "location": location.pk,
            "sector": self.sector.pk,
            "status": self.status.pk,
            "contract": self.contract.pk,
            "hours": self.hours.pk,
        }
        data.update(kwargs)
        return self.client.post(reverse('user-job-list'), data)

    def test_list(self):
        self.assertListEqual(
            self.process_jobs(self.client.get(reverse('user-job-list')).json()),
            self.process_jobs([
                self.get_job_data(
                    self.job,
                    jobs=[self.job.pk, self.job_2.pk],
                    locations=[self.location.pk, self.location_2.pk],
                ),
                self.get_job_data(
                    self.job_2,
                    jobs=[self.job.pk, self.job_2.pk],
                    locations=[self.location.pk, self.location_2.pk],
                ),
                self.get_job_data(
                    self.other_job,
                    jobs=[self.other_job.pk],
                    locations=[self.location.pk, self.location_2.pk],
                ),
            ]),
        )

    def test_retrieve(self):
        self.assertDictEqual(
            self.process_job(
                self.client.get(reverse('user-job-detail', kwargs={'pk': self.job.pk})).json(),
            ),
            self.get_job_data(
                self.job,
                jobs=[self.job.pk, self.job_2.pk],
                locations=[self.location.pk, self.location_2.pk],
            ),
        )

    def test_retrieve_wrong_owner(self):
        self.assertEqual(
            self.client.get(reverse('user-job-detail', kwargs={'pk': self.other_jobs[0].pk})).status_code,
            404,
        )

    def test_create(self):
        response = self._create_job(location=self.location)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        job = Job.objects.get(pk=data['id'])
        self.assertDictEqual(
            self.process_job(data),
            self.get_job_data(
                job,
                jobs=[self.job.pk, self.job_2.pk, data['id']],
                locations=[self.location.pk, self.location_2.pk],
            ),
        )

    def test_create_wrong_business_owner(self):
        self.assertEqual(self._create_job(location=self.other_locations[0]).status_code, 403)

    def test_create_as_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self._create_job(location=self.location)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        job = Job.objects.get(pk=data['id'])
        self.assertDictEqual(
            self.process_job(data),
            self.get_job_data(
                job,
                jobs=[self.job.pk, self.job_2.pk, data['id']],
                locations=[self.location.pk, self.location_2.pk],
            ),
        )

    def test_update(self):
        response = self.client.patch(reverse('user-job-detail', kwargs={'pk': self.job.pk}), {
            'title': "some title",
        })
        self.assertEqual(response.status_code, 200)
        job = Job.objects.get(pk=self.job.pk)
        self.assertDictEqual(
            self.process_job(response.json()),
            self.get_job_data(
                job,
                title='some title',
                updated=job.updated,
                jobs=[self.job.pk, self.job_2.pk],
                locations=[self.location.pk, self.location_2.pk],
            )
        )

    def test_update_wrong_business_owner(self):
        response = self.client.patch(reverse('user-job-detail', kwargs={'pk': self.other_jobs[0].pk}), {
            'title': "some title",
        })
        self.assertEqual(response.status_code, 404)

    def test_update_as_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.patch(reverse('user-job-detail', kwargs={'pk': self.job.pk}), {
            'title': "some title",
        })
        self.assertEqual(response.status_code, 200)
        job = Job.objects.get(pk=self.job.pk)
        self.assertDictEqual(
            self.process_job(response.json()),
            self.get_job_data(
                self.job,
                title='some title',
                updated=job.updated,
                jobs=[self.job.pk, self.job_2.pk],
                locations=[self.location.pk, self.location_2.pk],
            )
        )

    def test_update_as_wrong_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.patch(reverse('user-job-detail', kwargs={'pk': self.other_job.pk}), {
            'title': "some title",
        })
        self.assertEqual(response.status_code, 404)

    def test_delete(self):
        response = self.client.delete(reverse('user-job-detail', kwargs={'pk': self.job.pk}))
        self.assertEqual(response.status_code, 204)
        self.assertQuerysetEqual(Job.objects.filter(pk=self.job.pk), Business.objects.none())

    def test_delete_wrong_business_owner(self):
        response = self.client.delete(reverse('user-job-detail', kwargs={'pk': self.other_jobs[0].pk}))
        self.assertEqual(response.status_code, 404)

    def test_delete_as_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.delete(reverse('user-job-detail', kwargs={'pk': self.job.pk}))
        self.assertEqual(response.status_code, 204)
        self.assertQuerysetEqual(Job.objects.filter(pk=self.job.pk), Business.objects.none())

    def test_delete_as_wrong_location_user(self):
        self.location.business_users.add(self.business_user)
        response = self.client.delete(reverse('user-job-detail', kwargs={'pk': self.other_job.pk}))
        self.assertEqual(response.status_code, 404)
