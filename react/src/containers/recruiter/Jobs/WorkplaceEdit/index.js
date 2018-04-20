import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Checkbox, Button, Tooltip, notification } from 'antd';

import { saveWorkplace } from 'redux/recruiter/workplaces';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, PopupProgress, ImageSelector, NoLabelField, GoogleMap, Icons } from 'components';
import Wrapper from '../styled';
import StyledForm from './styled';

const { Item } = Form;
const { TextArea } = Input;

class WorkplaceEdit extends React.Component {
  state = {
    logo: {
      url: null,
      file: null,
      exist: false
    },
    location: {},
    loading: null
  };

  componentDidMount() {
    const { business, workplace, form } = this.props;

    if (!business) {
      this.goBuisinessList();
      return;
    }

    if (workplace) {
      this.setState({
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
    } else {
      this.setState({
        logo: {
          url: helper.getBusinessLogo(business),
          exist: false
        }
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

  goBuisinessList = () => {
    this.props.history.push('/recruiter/jobs/business');
  };

  goWorkplaceList = () => {
    const { business: { id }, history } = this.props;
    history.push(`/recruiter/jobs/workplace/${id}`);
  };

  selectLocation = (place_id, place_name, latitude, longitude) => {
    this.props.form.setFieldsValue({ place_name });
    this.setState({ location: { place_id, place_name, latitude, longitude } });
  };

  save = () => {
    const { form, business, workplace, saveWorkplace, history } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      saveWorkplace({
        data: {
          ...values,
          ...this.state.location,
          business: business.id,
          id: (workplace || {}).id
        },
        logo: this.state.logo,
        onSuccess: ({ id }) => {
          notification.success({
            message: 'Notification',
            description: 'Workplace is saved successfully.'
          });
          if (workplace) {
            this.goWorkplaceList();
          } else {
            history.push(`/recruiter/jobs/job/${id}`);
          }
        },
        onFail: error => {
          this.setState({ loading: null });
          notification.error({
            message: 'Notification',
            description: error
          });
        },
        onProgress: progress => {
          this.setState({
            loading: {
              label: 'Logo uploading...',
              progress: Math.floor(progress.loaded / progress.total * 100)
            }
          });
        }
      });
    });
  };

  render() {
    const { logo, loading } = this.state;
    const { business, workplace, form } = this.props;
    const { getFieldDecorator } = form;
    const { latitude, longitude, place_name } = this.state.location;
    const marker = latitude && { lat: latitude, lng: longitude };

    const title = workplace ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} Workplace`} />

        <PageHeader>
          <h2>{title} Workplace</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {business && <Link to={`/recruiter/jobs/workplace/${business.id}`}>Workplaces</Link>}
            </Breadcrumb.Item>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        <div className="content">
          <StyledForm>
            <Item label="Name">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: 'Please input workplace name!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(<Input autoFocus />)}
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
              {getFieldDecorator('place_name', {
                rules: [{ required: true, message: 'Please select your location!' }]
              })(<Input type="hidden" />)}
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
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button onClick={this.goWorkplaceList}>Cancel</Button>
            </NoLabelField>

            {loading && <PopupProgress label={loading.label} value={loading.progress} />}
          </StyledForm>
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemByID(state.rc_businesses.businesses, businessId);
    const workplaceId = helper.str2int(match.params.workplaceId);
    const workplace = helper.getItemByID(state.rc_workplaces.workplaces, workplaceId);
    return {
      business: business || (workplace || {}).business_data,
      workplace
    };
  },
  {
    saveWorkplace
  }
)(Form.create()(WorkplaceEdit));
