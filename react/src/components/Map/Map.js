import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
// import SearchBox from 'react-google-maps/lib/places/SearchBox';
import withScriptjs from 'react-google-maps/lib/async/withScriptjs';

// const SearchBoxStyle = {
//   border: 'none',
//   width: '240px',
//   margin: '9px',
//   padding: '7px 12px',
//   boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
//   fontSize: '14px',
//   outline: 'none',
//   textOverflow: 'ellipses',
// };

const AsyncGettingStartedExampleGoogleMap = withScriptjs(
  withGoogleMap(
    props => (
      <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={14}
        center={props.center}
        onClick={props.onClick}
        onBoundsChanged={props.onBoundsChanged}
      >
        {/* <SearchBox
          ref={props.onSearchBoxMounted}
          controlPosition={google.maps.ControlPosition.TOP_RIGHT}
          onPlacesChanged={props.onPlacesChanged}
          inputPlaceholder="Search"
          inputStyle={SearchBoxStyle}
        /> */}
        {
          props.marker && (<Marker position={props.marker} key="" />)
        }
      </GoogleMap>
    )
  )
);

export default class Map extends Component {
  static propTypes = {
    defaultCenter: PropTypes.object,
    marker: PropTypes.object,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    defaultCenter: null,
    marker: null,
    onClick: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      center: this.props.defaultCenter || { lat: 51.5074664, lng: -0.1281131 },
    };
    //   navigator.geolocation.getCurrentPosition(pos => {
    //     this.setState({
    //       center: {
    //         lat: pos.coords.latitude,
    //         lng: pos.coords.longitude
    //       }
    //     });
    //   });
  }

  onMapMounted = map => {
    this._map = map;
  }

  onBoundsChanged = () => {
    this.setState({
      bounds: this._map.getBounds(),
      center: this._map.getCenter(),
    });
  }

  onClick = event => {
    if (this.props.onClick) {
      const { latLng } = event;
      const location = { lat: latLng.lat(), lng: latLng.lng() };
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        let address = 'address unknown';
        if (status === 'OK') {
          if (results.length > 0) {
            address = results[0].formatted_address;
          }
        }
        this.props.onClick(location, address);
      });
    }
  }

  onSearchBoxMounted = searchBox => {
    this._searchBox = searchBox;
  }

  onPlacesChanged = () => {
    // const places = this._searchBox.getPlaces();
    // this.setState({
    //   center: mapCenter,
    // });
  }

  render() {
    const { marker } = this.props;
    const { center, bounds } = this.state;
    return (
      <AsyncGettingStartedExampleGoogleMap
        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDNZqqyhJYn94AaxORZyW88AqozrWMz0ho&libraries=places"
        loadingElement={<div />}
        containerElement={<div style={{ height: '100%' }} />}
        mapElement={<div style={{ height: '100%' }} />}
        center={center}
        bounds={bounds}
        marker={marker}
        onMapMounted={this.onMapMounted}
        onClick={this.onClick}
        onBoundsChanged={this.onBoundsChanged}
        onSearchBoxMounted={this.onSearchBoxMounted}
        onPlacesChanged={this.onPlacesChanged}
      />
    );
  }
}
