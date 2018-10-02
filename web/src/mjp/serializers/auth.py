from django.contrib.auth import get_user_model
from rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from rest_auth.serializers import LoginSerializer as BaseLoginSerializer
from rest_framework import serializers


class RegisterSerializer(BaseRegisterSerializer):
    def __init__(self, *args, **kwargs):
        super(RegisterSerializer, self).__init__(*args, **kwargs)
        del self.fields['username']

    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('email', ''),
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', '')
        }


class LoginSerializer(BaseLoginSerializer):
    def __init__(self, *args, **kwargs):
        super(LoginSerializer, self).__init__(*args, **kwargs)
        del self.fields['username']


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = get_user_model()
        fields = ('id', 'email', 'businesses', 'job_seeker', 'can_create_businesses')
        read_only_fields = ('id', 'email', 'businesses', 'job_seeker', 'can_create_businesses')


class UserDetailsSerializerV6(UserDetailsSerializer):
    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ('employees',)
        read_only_fields = UserDetailsSerializer.Meta.fields + ('employees',)
