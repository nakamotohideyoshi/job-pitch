from model_mommy import mommy
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from mjp.models import Business, BusinessUser, User, TokenStore, Location


class AuthenticatedRecruiterAPITestCase(APITestCase):
    maxDiff = None

    def setUp(self):
        super(AuthenticatedRecruiterAPITestCase, self).setUp()
        self.user = mommy.make(User, email='test@example.com')
        self.user.set_password('test')
        self.user.save()
        self.token_store = mommy.make(TokenStore, tokens=20)
        self.business = mommy.make(Business, token_store=self.token_store)
        self.business_user = mommy.make(BusinessUser, business=self.business, user=self.user)
        self.client.login(email='test@example.com', password="test")


class TestUserBusinessViewSet(AuthenticatedRecruiterAPITestCase):
    maxDiff = None

    def setUp(self):
        super(TestUserBusinessViewSet, self).setUp()
        self.other_businesses = mommy.make(Business, _quantity=3)

    def get_business_data(self, business, tokens=20, name=None, updated=None):
        return {
            "id": business.id,
            "name": business.name if name is None else name,
            "locations": [],
            "images": [],
            "tokens": tokens,
            "users": [self.user.id],
            "created": business.created.isoformat().split('+')[0] + 'Z',
            "updated": (business.updated if updated is None else updated).isoformat().split('+')[0] + 'Z',
        }

    def test_list(self):
        self.assertListEqual(
            self.client.get(reverse('user-business-list')).json(),
            [self.get_business_data(self.business)]
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

    def test_list(self):
        pass

    def test_retrieve(self):
        pass

    def test_retrieve_wrong_owner(self):
        pass  # nope

    def test_create(self):
        pass

    def test_create_wrong_business_owner(self):
        pass  # nope

    def test_create_as_location_user(self):
        pass  # nope

    def test_update(self):
        pass

    def test_update_wrong_business_owner(self):
        pass  # nope

    def test_update_as_location_user(self):
        pass

    def test_update_as_wrong_location_user(self):
        pass  # nope

    def test_delete(self):
        pass

    def test_delete_wrong_business_owner(self):
        pass  # nope

    def test_delete_as_location_user(self):
        pass  # nope
