from rest_framework import serializers

from mjp.models import InitialTokens


class AndroidPurchaseSerializer(serializers.Serializer):
    business_id = serializers.IntegerField()
    product_code = serializers.CharField()
    purchase_token = serializers.CharField()


class PayPalPurchaseSerializer(serializers.Serializer):
    business = serializers.IntegerField()
    product_code = serializers.CharField()


class InitialTokensSerializer(serializers.ModelSerializer):
    class Meta:
        model = InitialTokens
        fields = ('tokens',)