import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Checkbox, Row, Col, Button, Popover, message } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getWorkplacesSelector } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { saveWorkplaceAction } from 'redux/workplaces';
import { PageHeader, PageSubHeader, PopupProgress, ImageSelector, NoLabelField, GoogleMap, Icons } from 'components';
import Wrapper from '../styled';
import StyledForm from './styled';

const { Item } = Form;
const { TextArea } = Input;

/* eslint-disable react/prop-types */
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
    const { business, workplace, form, selectBusinessAction, history } = this.props;

    if (!business) {
      history.replace('/recruiter/jobs/business');
      return;
    }

    if (business.restricted) {
      history.replace(`/recruiter/jobs/workplace/${business.id}`);
      return;
    }

    selectBusinessAction(business.id);

    if (workplace) {
      this.setState({
        logo: {
          url: helper.getWorkplaceLogo(workplace),
          exist: (workplace.images || []).length > 0
        },
        location: {
          place_name: workplace.place_name,
          latitude: workplace.latitude,
          longitude: workplace.longitude
        }
      });

      form.setFieldsValue({
        name: workplace.name,
        email: workplace.email,
        mobile: workplace.mobile,
        mobile_public: workplace.mobile_public,
        description: workplace.description,
        street: workplace.street,
        city: workplace.city,
        region: workplace.region,
        postcode: workplace.postcode,
        country: workplace.country
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

  goWorkplaceList = () => {
    this.props.history.push(`/recruiter/jobs/workplace/${this.props.business.id}`);
  };

  selectLocation = (latitude, longitude, data) => {
    this.props.form.setFieldsValue({
      street: data.street,
      city: data.city,
      region: data.region,
      postcode: data.postcode,
      country: data.country
    });
    this.setState({
      location: {
        place_name: data.place_name,
        latitude,
        longitude
      }
    });
  };

  save = () => {
    const { form, business, workplace, saveWorkplaceAction, history } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      if (helper.checkIfEmailInString(values.description)) {
        form.setFields({
          description: {
            value: values.description,
            errors: [new Error(`Don't type in email address here.`)]
          }
        });
        return;
      }

      if (helper.checkIfPhoneNumberInString(values.description)) {
        form.setFields({
          description: {
            value: values.description,
            errors: [new Error(`Don't type in phone number here.`)]
          }
        });
        return;
      }

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      saveWorkplaceAction({
        data: {
          ...values,
          street_number: values.street,
          ...this.state.location,
          business: business.id,
          id: (workplace || {}).id
        },
        logo: this.state.logo,
        onSuccess: ({ id }) => {
          message.success('The workplace is saved');
          if (workplace) {
            this.goWorkplaceList();
          } else {
            history.push(`/recruiter/jobs/job/${id}`);
          }
        },
        onFail: error => {
          this.setState({ loading: null });
          message.error(error);
        },
        onProgress: progress => {
          this.setState({
            loading: {
              label: 'Logo uploading...',
              progress: Math.floor((progress.loaded / progress.total) * 100)
            }
          });
        }
      });
    });
  };

  render() {
    const { logo, loading, location } = this.state;
    const { business, workplace, form } = this.props;
    const { getFieldDecorator } = form;
    const { latitude, longitude } = location;
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
                  <Popover
                    placement="right"
                    content={
                      <span>
                        This is the email that notifications
                        <br />
                        will be sent to, it can be different
                        <br />
                        to your login email address.
                      </span>
                    }
                  >
                    <Icons.QuestionCircle />
                  </Popover>
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

            <Item
              label={
                <span>
                  Description&nbsp;
                  <Popover
                    placement="right"
                    content={
                      <span>
                        Don't type in phone numbers or
                        <br />
                        email address here.
                      </span>
                    }
                  >
                    <Icons.QuestionCircle />
                  </Popover>
                </span>
              }
            >
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
                  <Popover
                    placement="right"
                    content={
                      <span>
                        Search for a place name, street, postcode,
                        <br />
                        etc. or click the map to select location.
                      </span>
                    }
                  >
                    <Icons.QuestionCircle />
                  </Popover>
                </span>
              }
              style={{ marginBottom: '0' }}
            >
              {getFieldDecorator('street', {
                rules: [{ required: true, message: 'Please input street!' }]
              })(<Input placeholder="Street" />)}
            </Item>

            <div className="addressInfo">
              <Row gutter={8}>
                <Col span={12}>
                  <Item>
                    {getFieldDecorator('city', {
                      rules: [{ required: true, message: 'Please input city!' }]
                    })(<Input placeholder="City" />)}
                  </Item>
                </Col>
                <Col span={12}>
                  <Item>
                    {getFieldDecorator('region', {
                      rules: [{ required: true, message: 'Please input region!' }]
                    })(<Input placeholder="Region" />)}
                  </Item>
                </Col>
              </Row>
              <Row gutter={8}>
                <Col span={12}>
                  <Item>
                    {getFieldDecorator('postcode', {
                      rules: [{ required: true, message: 'Please input postcode!' }]
                    })(<Input placeholder="Postcode" />)}
                  </Item>
                </Col>
                <Col span={12}>
                  <Item>
                    {getFieldDecorator('country', {
                      rules: [{ required: true, message: 'Please input country!' }]
                    })(<Input placeholder="Country" />)}
                  </Item>
                </Col>
              </Row>
            </div>

            <NoLabelField>
              <div className="map">
                <div>
                  <GoogleMap marker={marker} onSelectedLocation={this.selectLocation} />
                </div>
              </div>
            </NoLabelField>

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
    const business = helper.getItemById(state.businesses.businesses, businessId);
    const workplaceId = helper.str2int(match.params.workplaceId);
    const workplace = helper.getItemById(getWorkplacesSelector(state), workplaceId);
    return {
      business: business || (workplace || {}).business_data,
      workplace
    };
  },
  {
    saveWorkplaceAction,
    selectBusinessAction
  }
)(Form.create()(WorkplaceEdit));
