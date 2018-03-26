import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Checkbox, Button, Tooltip, message } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faQuestionCircle from '@fortawesome/fontawesome-free-regular/faQuestionCircle';
import { PopupProgress, ImageSelector, NoLabelField, GoogleMap } from 'components';
import Wrapper from './Wrapper';

import { selectBusiness } from 'redux/recruiter/businesses';
import { getWorkplace, saveWorkplace } from 'redux/recruiter/workplaces';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

const { Item } = Form;
const { TextArea } = Input;

class WorkplaceEdit extends React.Component {
  state = {
    location: {},
    logo: {
      url: null,
      file: null,
      exist: false
    }
  };

  componentDidMount() {
    const { match, selectBusiness, getWorkplace, form } = this.props;
    const businessId = parseInt(match.params.businessId, 10);
    if (businessId) {
      selectBusiness({
        id: businessId,
        success: business =>
          this.setState({
            logo: {
              url: helper.getBusinessLogo(business),
              exist: false
            }
          }),
        fail: this.goBuisinessList
      });
      return;
    }

    const workplaceId = parseInt(match.params.workplaceId, 10);
    getWorkplace({
      id: workplaceId,
      success: workplace => {
        this.setState({
          workplace,
          logo: {
            url: helper.getWorkplaceLogo(workplace),
            exist: (workplace.images || []).length > 0
          }
        });
        this.selectLocation(workplace.place_id, workplace.place_name, workplace.latitude, workplace.longitude);

        form.setFieldsValue({
          name: workplace.name,
          email: workplace.email,
          mobile: workplace.mobile,
          mobile_public: workplace.mobile_public,
          description: workplace.description,
          place_name: workplace.place_name
        });
      },
      fail: this.goBuisinessList
    });
  }

  setLogo = (file, url) =>
    this.setState({
      logo: {
        url: url || helper.getBusinessLogo(this.props.business),
        file,
        exist: !!file
      }
    });

  goBuisinessList = () => this.props.history.push('/recruiter/jobs/business');

  goWorkplaceList = () => {
    const { business, history } = this.props;
    const { workplace } = this.state;
    history.push(`/recruiter/jobs/workplace/${business.id || workplace.business}`);
  };

  selectLocation = (place_id, place_name, latitude, longitude) => {
    this.props.form.setFieldsValue({ place_name });
    this.setState({ location: { place_id, place_name, latitude, longitude } });
  };

  save = () => {
    const { form, business, saveWorkplace } = this.props;
    const { workplace } = this.state;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      const { logo } = this.state;
      saveWorkplace({
        data: {
          ...values,
          ...this.state.location,
          business: (business || {}).id || (workplace || {}).business,
          id: (workplace || {}).id
        },
        logo,
        onUploading: progress => {
          const uploading = progress ? Math.floor(progress.loaded / progress.total * 100) : null;
          this.setState({ uploading });
        },
        onSuccess: () => {
          message.success('Workplace saved successfully!');
        },
        onFail: error => {
          message.error(error);
        }
      });
    });
  };

  render() {
    const { business, saving, form } = this.props;
    const { workplace } = this.state;
    const business1 = business || (workplace || {}).business_data || {};
    const { getFieldDecorator } = form;
    const { latitude, longitude, place_name } = this.state.location;
    const marker = latitude && { lat: latitude, lng: longitude };
    const { logo, uploading } = this.state;

    return (
      <Wrapper>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs/business">Businesses</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/recruiter/jobs/workplace/${business1.id}`}>Workplaces</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {business && 'Add'}
            {workplace && 'Edit'}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Form>
          <Item label="Name">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: 'Please input workplace name!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<Input />)}
          </Item>

          <Item
            className="with-public"
            label={
              <span>
                Email&nbsp;
                <Tooltip title="This is the email that notifications will be sent to, it can be different to your login email address.">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </Tooltip>
              </span>
            }
          >
            {getFieldDecorator('email', {
              initialValue: DATA.email,
              rules: [
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'The input is not valid email!' }
              ]
            })(<Input />)}
          </Item>
          <div className="public-check">
            {getFieldDecorator('email_public', { valuePropName: 'checked', initialValue: true })(
              <Checkbox>Public</Checkbox>
            )}
          </div>

          <Item label="Phone number" className="with-public">
            {getFieldDecorator('mobile')(<Input />)}
          </Item>
          <div className="public-check">
            {getFieldDecorator('mobile_public', { valuePropName: 'checked', initialValue: true })(
              <Checkbox>Public</Checkbox>
            )}
          </div>

          <Item label="Description">
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: 'Please enter description!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
          </Item>

          <Item
            label={
              <span>
                Match area&nbsp;
                <Tooltip title="Search for a place name, street, postcode, etc. or click the map to select location.">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                </Tooltip>
              </span>
            }
            extra={place_name}
          >
            {getFieldDecorator('place_name', { rules: [{ required: true, message: 'Please select your location!' }] })(
              <Input type="hidden" />
            )}
            <div className="map">
              <div>
                <GoogleMap marker={marker} onSelectedLocation={this.selectLocation} />
              </div>
            </div>
          </Item>

          <Item label="Logo">
            <ImageSelector url={logo.url} removable={logo.exist} onChange={this.setLogo} />
          </Item>

          <NoLabelField className="subimt-field">
            <Button type="primary" loading={saving} onClick={this.save}>
              Save
            </Button>
            <Button onClick={this.goWorkplaceList}>Cancel</Button>
          </NoLabelField>

          {uploading && <PopupProgress label="Logo uploading..." value={uploading} />}
        </Form>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    business: state.rc_businesses.business,
    saving: state.rc_workplaces.saving
  }),
  {
    selectBusiness,
    getWorkplace,
    saveWorkplace
  }
)(Form.create()(WorkplaceEdit));
