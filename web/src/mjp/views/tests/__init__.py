from model_mommy import mommy
from rest_framework.test import APITestCase

from mjp.models import User


class AuthenticatedAPITestCase(APITestCase):
    maxDiff = None

    def setUp(self):
        super(AuthenticatedAPITestCase, self).setUp()
        self.user = mommy.make(User, email='test@example.com')
        self.user.set_password('test')
        self.user.save()
        self.client.login(email='test@example.com', password="test")
