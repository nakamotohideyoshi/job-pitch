from django.contrib.auth import get_user_model
from rest_framework import serializers

def SimpleSerializer(m,  overrides={}):
    class Meta:
        model = m
    fields = {'Meta': Meta}
    fields.update(overrides)
    return type(str("%sSerializer" % m._meta.object_name),
                (serializers.ModelSerializer,),
                fields,
                )

class UserDetailsSerializer(serializers.ModelSerializer):
    """
    User model w/o password
    """
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'businesses', 'job_seeker')
        read_only_fields = ('id', 'username', 'job_seeker', 'businesses')
