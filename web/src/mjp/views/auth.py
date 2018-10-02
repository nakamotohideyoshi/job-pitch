from rest_auth.views import UserDetailsView as DefaultUserDetailsView

from mjp.serializers.auth import UserDetailsSerializer, UserDetailsSerializerV6


class UserDetailsView(DefaultUserDetailsView):
    def get_serializer_class(self):
        try:
            version = int(self.request.version)
        except (TypeError, ValueError):
            version = 1
        if version >= 6:
            return UserDetailsSerializerV6
        return UserDetailsSerializer
