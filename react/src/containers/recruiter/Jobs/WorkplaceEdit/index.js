import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Checkbox, Spin, Button, Tooltip, message } from 'antd';

import { getBusinesses, selectBusiness } from 'redux/recruiter/businesses';
import { getWorkplaces, getWorkplace, saveWorkplace } from 'redux/recruiter/workplaces';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PopupProgress, ImageSelector, NoLabelField, GoogleMap, Loading, AlertMsg, Icons } from 'components';
import StyledForm from './styled';

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

  componentWillMount() {
    const { businessId, businesses, workplaceId, workplaces, getBusinesses, getWorkplaces } = this.props;
    if (businessId && !businesses) {
      getBusinesses();
    }
    if (workplaceId && !workplaces) {
      getWorkplaces();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { businessId, businesses, business, workplaceId, workplaces, workplace, history, form } = nextProps;
    if ((businessId && businesses && !business) || (workplaceId && workplaces && !workplace)) {
      history.replace('/recruiter/jobs/business');
      return;
    }

    if (businessId && !this.props.business && business) {
      this.setState({
        logo: {
          url: helper.getBusinessLogo(business),
          exist: false
        }
      });
      return;
    }

    if (workplaceId && !this.props.workplace && workplace) {
      this.setState({
        logo: {
          url: helper.getWorkplaceLogo(workplace),
          exist: (workplace.images || []).length
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
    }
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
    const { form, business, workplace, saveWorkplace } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      const { logo } = this.state;
      saveWorkplace({
        data: {
          ...values,
          ...this.state.location,
          business: business.id,
          id: (workplace || {}).id
        },
        logo,
        onUploading: progress => {
          const uploading = progress ? Math.floor(progress.loaded / progress.total * 100) : null;
          this.setState({ uploading });
        }
      });
    });
  };

  renderForm = () => {
    const { saving, form } = this.props;
    const { getFieldDecorator } = form;
    const { latitude, longitude, place_name } = this.state.location;
    const marker = latitude && { lat: latitude, lng: longitude };
    const { logo, uploading } = this.state;
    return (
      <StyledForm>
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
                <Icons.QuestionCircle />
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
                <Icons.QuestionCircle />
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
      </StyledForm>
    );
  };

  render() {
    const { businessId, business, workplaceId, workplace } = this.props;
    return (
      <Fragment>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs/business">Businesses</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {business && <Link to={`/recruiter/jobs/workplace/${business.id}`}>Workplaces</Link>}
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {business && !!businessId && 'Add'}
            {business && !!workplaceId && 'Edit'}
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className="content">
          {!business && !workplace ? <Spin size="large">{this.renderForm()}</Spin> : this.renderForm()}
        </div>
      </Fragment>
    );
  }
}

export default connect(
  (state, props) => {
    const { businesses } = state.rc_businesses;
    const businessId = parseInt(props.match.params.businessId, 10);
    const business = businessId && helper.getItemByID(businesses || [], businessId);

    const { workplaces } = state.rc_workplaces;
    const workplaceId = parseInt(props.match.params.workplaceId, 10);
    const workplace = workplaceId && helper.getItemByID(workplaces || [], workplaceId);

    return {
      businessId,
      businesses,
      business: business || (workplace || {}).business_data,
      workplaceId,
      workplaces,
      workplace,
      saving: state.rc_workplaces.saving
    };
  },
  {
    getBusinesses,
    getWorkplaces,
    saveWorkplace
  }
)(Form.create()(WorkplaceEdit));
