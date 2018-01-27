/* global google */
import React from 'react';
import styled from 'styled-components';
import { compose, withProps, lifecycle } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
const { SearchBox } = require('react-google-maps/lib/components/places/SearchBox');

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
      const { defaultCenter, markers, onSelectedLocation, options } = this.props;

      this.setState({
        bounds: null,
        center: defaultCenter || { lat: 0, lng: 0 },
        markers,
        options: options,
        onMapMounted: ref => {
          this.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: this.map.getBounds(),
            center: this.map.getCenter()
          });
        },
        onClickMap: event => {
          if (onSelectedLocation) {
            const location = event.latLng;
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location }, (results, status) => {
              if (results && results[0]) {
                onSelectedLocation(results[0].place_id, results[0].formatted_address, location.lat(), location.lng());
              }
            });
          }
        },
        onSearchBoxMounted: onSelectedLocation
          ? ref => {
              this.searchBox = ref;
            }
          : null,
        onPlacesChanged: () => {
          const places = this.searchBox.getPlaces();
          const place = places[0];
          onSelectedLocation(
            place.place_id,
            place.formatted_address,
            place.geometry.location.lat(),
            place.geometry.location.lng()
          );
          this.setState({ center: place.geometry.location });
        }
      });

      if (!defaultCenter) {
        navigator.geolocation.getCurrentPosition(pos => {
          this.setState({
            center: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            }
          });
        });
      }
    },

    componentWillReceiveProps(nextProps) {
      const { markers } = nextProps;
      if (markers) {
        this.setState({ markers });
      }
    }
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    ref={props.onMapMounted}
    defaultZoom={14}
    center={props.center}
    options={props.options}
    onClick={props.onClickMap}
    onBoundsChanged={props.onBoundsChanged}
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

    {props.markers && props.markers.map((position, index) => <Marker key={index} position={position} />)}
  </GoogleMap>
));

export default MapWithASearchBox;
