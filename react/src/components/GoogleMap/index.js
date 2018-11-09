/* global google */
import React from 'react';
import styled from 'styled-components';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Circle } from 'react-google-maps';
import { SearchBox } from 'react-google-maps/lib/components/places/SearchBox';

const Input = styled.input`
  border: none;
  width: 240px;
  margin: 10px;
  padding: 7px 12px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  border-radius: 2px;
  outline: 0;
`;

const MapWithASearchBox = compose(
  withProps({
    googleMapURL:
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyDNZqqyhJYn94AaxORZyW88AqozrWMz0ho&libraries=places',
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `100%` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  lifecycle({
    componentWillMount() {
      const { marker, onSelectedLocation, options } = this.props;

      const getAddress = location => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, results => {
          if (results && results[0]) {
            let data = {
              place_name: results[0].formatted_address,
              street: '',
              sublocality: ''
            };
            results[0].address_components.forEach(({ long_name, types }) => {
              types.forEach(type => {
                if (!data.street_number && type === 'street_number') {
                  data.street_number = long_name;
                } else if (!data.street && type === 'route') {
                  data.street = long_name;
                } else if (type === 'sublocality') {
                  data.sublocality = `${data.sublocality} ${long_name}`;
                } else if (!data.city && type === 'locality') {
                  data.city = long_name;
                } else if (!data.region && type === 'administrative_area_level_2') {
                  data.city = data.city || long_name;
                } else if (!data.region && type === 'administrative_area_level_1') {
                  data.region = long_name;
                } else if (!data.country && type === 'country') {
                  data.country = long_name;
                } else if (!data.postcode && type === 'postal_code') {
                  data.postcode = long_name;
                }
              });
            });

            if (data.street_number) {
              data.street = `${data.street_number} ${data.street}`;
            }
            data.street = data.street || data.sublocality;

            onSelectedLocation(location.lat(), location.lng(), data);
          }
        });
      };

      this.setState({
        bounds: null,
        center: marker || { lat: 1, lng: 1 },
        marker,
        options,
        onMapMounted: ref => {
          this.map = ref;
        },
        onSearchBoxMounted: onSelectedLocation
          ? ref => {
              this.searchBox = ref;
            }
          : null,
        onBoundsChanged: () => {
          this.setState({
            bounds: this.map.getBounds()
          });
        },
        onClickMap: event => {
          getAddress(event.latLng);
        },
        onPlacesChanged: () => {
          const places = this.searchBox.getPlaces();
          const place = places[0];
          this.setState({ center: place.geometry.location });
          getAddress(place.geometry.location);
        }
      });
    },

    componentWillReceiveProps(nextProps) {
      const { marker } = nextProps;
      if (marker) {
        if (!this.props.marker) {
          this.setState({ center: marker });
        }
        this.setState({ marker });
      }
    }
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    ref={props.onMapMounted}
    zoom={props.zoom || 14}
    center={props.center}
    options={props.options}
    onBoundsChanged={props.onBoundsChanged}
    onClick={props.onClickMap}
  >
    {props.onSearchBoxMounted && (
      <SearchBox
        ref={props.onSearchBoxMounted}
        bounds={props.bounds}
        controlPosition={google.maps.ControlPosition.TOP_RIGHT}
        onPlacesChanged={props.onPlacesChanged}
      >
        <Input placeholder="Search" />
      </SearchBox>
    )}
    {props.circle && <Circle {...props.circle} onClick={props.onClickMap} />}
    {!props.circle && props.marker && <Marker position={props.marker} />}
  </GoogleMap>
));

export default MapWithASearchBox;
