import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import { Loading, FormComponent, Map } from 'components';
import * as commonActions from 'redux/modules/common';
import * as authActions from 'redux/modules/auth';
import * as utils from 'helpers/utils';

const SEARCH_RADIUS = [
  { id: 1, name: '1 mile' },
  { id: 2, name: '2 miles' },
  { id: 5, name: '5 miles' },
  { id: 10, name: '10 miles' },
  { id: 50, name: '50 miles' },
];

@connect(
  state => ({
    jobSeeker: state.auth.jobSeeker,
    staticData: state.auth.staticData,
    loading: state.auth.loading,
  }),
  { ...commonActions, ...authActions })
export default class JobProfile extends FormComponent {
  static propTypes = {
    jobSeeker: PropTypes.object.isRequired,
    staticData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    getJobProfile: PropTypes.func.isRequired,
    saveJobProfile: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { staticData } = this.props;
    this.contracts = [{ id: -1, name: 'Any' }].concat(staticData.contracts);
    this.hours = [{ id: -1, name: 'Any' }].concat(staticData.hours);
    this.getJobProfile()
    .then(profile => {
      const formModel = Object.assign({}, profile);
      formModel.sectors = staticData.sectors.filter(item => profile.sectors.includes(item.id));
      formModel.contract = this.contracts.filter(item => item.id === (profile.contract || -1))[0];
      formModel.hours = this.hours.filter(item => item.id === (profile.hours || -1))[0];
      formModel.search_radius = SEARCH_RADIUS.filter(item => item.id === profile.search_radius)[0];
      const markerPos = profile.latitude && { lat: profile.latitude, lng: profile.longitude };
      this.setState({ profile, formModel, markerPos });
    });
  }

  onClickMap = (pos, address) => {
    const { formModel, errors } = this.state;
    formModel.place_name = address;
    errors.place_name = null;
    this.setState({
      formModel,
      errors,
      markerPos: pos,
    });
  }

  getJobProfile = () => {
    const { jobSeeker, getJobProfile } = this.props;
    if (jobSeeker.profile) {
      return getJobProfile(jobSeeker.profile);
    }
    return Promise.resolve({
      job_seeker: jobSeeker.id,
      sectors: [],
      contract: this.contracts[0].id,
      hours: this.hours[0].id,
      search_radius: SEARCH_RADIUS[2].id,
    });
  }

  onSave = () => {
    if (!this.isValid(['sectors', 'place_name'])) return;

    const { saveJobProfile, setPermission } = this.props;
    const { formModel, markerPos } = this.state;
    const data = Object.assign(this.state.profile, formModel);
    data.sectors = formModel.sectors.map(item => item.id);
    data.contract = formModel.contract.id !== -1 ? formModel.contract.id : null;
    data.hours = formModel.hours.id !== -1 ? formModel.hours.id : null;
    data.search_radius = formModel.search_radius.id;
    data.latitude = markerPos.lat;
    data.longitude = markerPos.lng;

    saveJobProfile(data).then(profile => {
      this.setState({ profile });
      setPermission(2);
      utils.successNotif('Success!');
    })
    .catch(errors => this.setState({ errors }));
  }

  render() {
    const { staticData, loading } = this.props;
    const { profile, markerPos } = this.state;
    return (
      <div>
        <Helmet title="Job Profile" />
        {
          !profile ?
            <Loading /> :
            <div>
              <div className="pageHeader">
                <h1>Job Profile</h1>
              </div>
              <div className="board">
                <Form horizontal>
                  <this.SelectFieldGroup
                    label="Sectors"
                    name="sectors"
                    dataSource={staticData.sectors}
                    placeholder="Select Sectors"
                    multiple
                    searchable
                    searchPlaceholder="Search"
                  />
                  <this.SelectFieldGroup
                    label="Contract"
                    name="contract"
                    dataSource={this.contracts}
                  />
                  <this.SelectFieldGroup
                    label="Hours"
                    name="hours"
                    dataSource={this.hours}
                  />
                  <this.TextFieldGroup
                    type="text"
                    label="Match area"
                    help={`In order to match you with jobs in your area, you must tell us your location, 
                      and specify the maximum distance to search.`}
                    name="place_name"
                    disabled
                  />
                  <FormGroup>
                    <Col smOffset={2} sm={10} style={{ height: '300px' }}>
                      <Map
                        defaultCenter={markerPos}
                        marker={markerPos}
                        onClick={this.onClickMap}
                      />
                    </Col>
                  </FormGroup>
                  <this.SelectFieldGroup
                    label="Radius"
                    name="search_radius"
                    dataSource={SEARCH_RADIUS}
                  />
                  <this.SubmitButtonGroup
                    submtting={loading}
                    labels={['Save', 'Saving...']}
                    onClick={this.onSave}
                  />
                </Form>
              </div>
            </div>
        }
      </div>
    );
  }
}
