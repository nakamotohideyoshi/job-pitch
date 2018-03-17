import json
import logging

import paypalrestsdk
from apiclient.discovery import build
from apiclient.errors import HttpError
from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.http import HttpResponseRedirect
from django.views.generic import View
from httplib2 import Http
from oauth2client.service_account import ServiceAccountCredentials
from paypalrestsdk import WebProfile, Payment
from rest_framework import permissions, status, serializers
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView

from mjp.models import AndroidPurchase, TokenStore, ProductTokens, Business, PayPalProduct, InitialTokens
from mjp.serializers import (
    BusinessSerializer,
)
from mjp.serializers.ecommerce import AndroidPurchaseSerializer, PayPalPurchaseSerializer, InitialTokensSerializer


class AndroidPurchaseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = AndroidPurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        credentials = ServiceAccountCredentials.from_json_keyfile_name(
            '/web/mjp/keys/google-api.json',
            ['https://www.googleapis.com/auth/androidpublisher']
        )
        http_auth = credentials.authorize(Http())
        service = build('androidpublisher', 'v2', http=http_auth)
        request = service.purchases().products().get(
            packageName='com.myjobpitch',
            productId=serializer.data['product_code'],
            token=serializer.data['purchase_token'],
        )

        try:
            response = request.execute()
        except HttpError as e:
            print "android purchase API error {}".format(e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        with transaction.atomic():
            if not AndroidPurchase.objects.filter(purchase_token=serializer.data['purchase_token']).exists():
                token_store = TokenStore.objects.select_for_update().get(
                    businesses__pk=serializer.data['business_id'],
                )
                AndroidPurchase.objects.create(
                    product_code=serializer.data['product_code'],
                    purchase_token=serializer.data['purchase_token'],
                    token_store=token_store,
                )
                TokenStore.objects.filter(pk=token_store.pk).update(
                    tokens=F('tokens') + ProductTokens.objects.get(sku=serializer.data['product_code']).tokens,
                )

        business = Business.objects.get(pk=serializer.data['business_id'])
        output_serializer = BusinessSerializer(business, context={
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        })
        return Response(output_serializer.data)


class PayPalPurchaseView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PayPalPurchaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        errors = {}

        try:
            product = PayPalProduct.objects.get(product_code=serializer.data['product_code'])
        except PayPalProduct.DoesNotExist:
            errors['product_code'] = "Not found"

        try:
            business = request.user.businesses.get(pk=serializer.data['business'])
        except Business.DoesNotExist:
            errors['business'] = "Not found"

        if errors:
            raise serializers.ValidationError(errors)

        paypalrestsdk.configure(settings.PAYPAL_TOKEN)

        # Create Payment and return status
        payment = self.create_payment(request, business, product)
        if payment.create():
            print payment
            for link in payment.links:
                if link.rel == "approval_url":
                    return Response({'approval_url': str(link.href)})
            raise serializers.ValidationError({"error": "couldn't get approval url"})
        else:
            raise serializers.ValidationError({"error": payment.error})

    def create_payment(self, request, business, product):
        profile = None
        profiles = WebProfile.all()
        if isinstance(profiles, list) and profiles:
            for candidate_profile in profiles:
                if candidate_profile.name == 'no_shipping':
                    profile = candidate_profile
                    break
        if profile is None:
            profile = WebProfile({
                "name": "no_shipping",
                "input_fields": {
                    "no_shipping": 1,
                }
            })
            if not profile.create():
                profile = None

        return Payment({
            "intent": "sale",

            "experience_profile_id": profile.id if profile else None,

            # Payer
            # A resource representing a Payer that funds a payment
            # Payment Method as 'paypal'
            "payer": {
                "payment_method": "paypal"
            },
            # Redirect URLs
            "redirect_urls": {
                "return_url": reverse("paypal-confirm", request=request),
                "cancel_url": request.build_absolute_uri('/recruiter/credits/purchase-cancel'),
            },
            "transactions": [{
                "custom": json.dumps({"tokens": product.tokens, "business": business.id}),
                "description": "{} tokens".format(product.tokens),
                "amount": {"total": str(product.price), "currency": "GBP"},
                "item_list": {
                    "items": [
                        {
                            "description": "{} tokens for {}".format(product.tokens, business.name),
                            "quantity": 1,
                            "price": str(product.price),
                            "currency": "GBP",
                        },
                    ],
                }
            }],
        })


class PayPalPurchaseConfirmView(View):
    def get(self, request):
        try:
            paypalrestsdk.configure(settings.PAYPAL_TOKEN)

            payment = Payment.find(request.GET['paymentId'])

            # Execute payment using payer_id obtained when creating the payment (following redirect)
            if payment.execute({"payer_id": request.GET['PayerID']}):
                for trans in payment.transactions:
                    data = json.loads(trans.custom)
                    business = Business.objects.get(pk=data['business'])
                    TokenStore.objects.filter(pk=business.token_store_id).update(
                        tokens=F('tokens') + data['tokens'],
                    )
                    return HttpResponseRedirect('/recruiter/credits/purchase-success')
            else:
                return HttpResponseRedirect('/recruiter/credits/purchase-error?error={}'.format(payment.error))
        except Exception:
            logging.exception("Error processing paypal payment")
            return HttpResponseRedirect('/recruiter/credits/purchase-error?error={}'.format("Unknown error"))


class InitialTokensView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = InitialTokensSerializer(instance=InitialTokens.objects.get())
        return Response(serializer.data)
