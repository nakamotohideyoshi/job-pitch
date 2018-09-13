import React from 'react';
import { connect } from 'react-redux';
import { Form, Input, Button, Select, Popover, message, notification } from 'antd';

import { saveJobProfile } from 'redux/jobseeker/profile';
import DATA from 'utils/data';
import colors from 'utils/colors';
import * as helper from 'utils/helper';

import { NoLabelField, GoogleMap, Icons } from 'components';
import FormWrapper from './styled';

const { Item } = Form;
const { Option } = Select;

class JobProfile extends React.Component {
  state = {
    loading: false,
    location: {}
  };

  hours = [{ id: -1, name: 'Any' }].concat(DATA.hours);
  contracts = [{ id: -1, name: 'Any' }].concat(DATA.contracts);

  componentDidMount() {
    const { profile } = this.props;
    if (profile) {
      this.props.form.setFieldsValue({
        sectors: profile.sectors,
        contract: profile.contract || -1,
        hours: profile.hours || -1,
        place_name: profile.place_name,
        search_radius: profile.search_radius
      });

      this.selectLocation(profile.place_id, profile.place_name, profile.latitude, profile.longitude);
    }

    if (helper.loadData('apply')) {
      helper.saveData('apply');
      notification.success({
        message: 'Application submitted successfully.'
      });
    }
  }

  save = () => {
    const { form, saveJobProfile, jobseeker, profile } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({ loading: true });
      saveJobProfile({
        data: {
          ...values,
          ...this.state.location,
          contract: values.contract !== -1 ? values.contract : null,
          hours: values.hours !== -1 ? values.hours : null,
          job_seeker: jobseeker.id,
          id: (profile || {}).id
        },
        success: () => {
          this.setState({ loading: false });
          message.success('Job Profile saved successfully!!');

          if (!profile) {
            setTimeout(() => this.props.history.push('/jobseeker/find'));
          }
        },
        fail: data => {
          this.setState({ loading: false });
          helper.setErrors(form, data, values);
        }
      });
    });
  };

  selectLocation = (place_id, place_name, latitude, longitude) => {
    this.props.form.setFieldsValue({ place_name });
    this.setState({ location: { place_id, place_name, latitude, longitude } });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { latitude, longitude, place_name } = this.state.location;
    const marker = latitude && { lat: latitude, lng: longitude };

    const search_radius = this.props.form.getFieldValue('search_radius');
    if (!this.zoom) {
      this.zoom = { 1: 13, 2: 12, 5: 11, 10: 10, 50: 7 }[search_radius];
    }
    const circle = {
      center: marker,
      radius: 1609.344 * search_radius,
      options: {
        fillColor: '#ff930080',
        strokeColor: colors.green,
        strokeWeight: 2
      }
    };

    return (
      <FormWrapper>
        <Item label="Sectors">
          {getFieldDecorator('sectors', { rules: [{ required: true, message: 'Please select sectors!' }] })(
            <Select
              mode="multiple"
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {DATA.sectors.map(({ id, name }) => (
                <Option value={id} key={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Item>

        <Item label="Contract">
          {getFieldDecorator('contract', { initialValue: -1 })(
            <Select>
              {this.contracts.map(({ id, name }) => (
                <Option value={id} key={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Item>

        <Item label="Hours">
          {getFieldDecorator('hours', { initialValue: -1 })(
            <Select>
              {this.hours.map(({ id, name }) => (
                <Option value={id} key={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Item>

        <Item
          label={
            <span>
              Match area&nbsp;
              <Popover
                placement="right"
                content={
                  <span>
                    Search for a place name, street, postcode, etc.<br />
                    or click the map to select location.
                  </span>
                }
              >
                <Icons.QuestionCircle />
              </Popover>
            </span>
          }
          extra={place_name}
        >
          {getFieldDecorator('place_name', { rules: [{ required: true, message: 'Please select your location!' }] })(
            <Input type="hidden" />
          )}
          <div className="map">
            <div>
              <GoogleMap marker={marker} circle={circle} zoom={this.zoom} onSelectedLocation={this.selectLocation} />
            </div>
          </div>
        </Item>

        <Item label="Radius">
          {getFieldDecorator('search_radius', { initialValue: 5 })(
            <Select>
              {DATA.searchRadius.map(({ id, name }) => (
                <Option value={id} key={id}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        </Item>

        <NoLabelField>
          <Button type="primary" loading={this.state.loading} onClick={this.save}>
            Save
          </Button>
        </NoLabelField>
      </FormWrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    profile: state.js_profile.profile
  }),
  { saveJobProfile }
)(Form.create()(JobProfile));
