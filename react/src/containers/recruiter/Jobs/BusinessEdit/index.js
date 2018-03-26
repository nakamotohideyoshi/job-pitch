import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Button, message } from 'antd';
import { AlertMsg, PopupProgress, ImageSelector } from 'components';

import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { updateStatus, getBusinesses, saveBusiness } from 'redux/recruiter/businesses';
import Wrapper from './Wrapper';

const { Item } = Form;

class BusinessEdit extends React.Component {
  state = {
    business: null,
    loading: false,
    progress: null,
    logo: {
      url: null,
      file: null,
      exist: false
    }
  };

  componentDidMount() {
    const { match, businesses, getBusinesses } = this.props;
    this.businessId = parseInt(match.params.businessId, 10);
    if (this.businessId) {
      if (businesses.length) {
        this.getBusiness();
      } else {
        getBusinesses({
          success: this.getBusiness
        });
      }
    } else {
      this.setState({
        logo: {
          url: helper.getBusinessLogo()
        }
      });
    }
  }

  getBusiness = () => {
    const { updateStatus, businesses, form } = this.props;
    const business = helper.getItemByID(businesses, this.businessId);
    if (business) {
      form.setFieldsValue({
        name: business.name
      });

      this.setState({
        business,
        logo: {
          url: helper.getBusinessLogo(business),
          exist: (business.images || []).length > 0
        }
      });

      updateStatus({ credits: business.tokens });
    } else {
      this.goBuisinessList();
    }
  };

  setLogo = (file, url) =>
    this.setState({
      logo: {
        url: url || helper.getBusinessLogo(),
        file,
        exist: !!file
      }
    });

  addCredit = () => this.props.history.push(`/recruiter/settings/credits/${this.businessId}`);

  goBuisinessList = () => this.props.history.push('/recruiter/jobs/business');

  save = () => {
    const { form, saveBusiness } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      const { logo } = this.state;
      this.setState({ loading: true });
      saveBusiness({
        data: {
          ...values,
          id: this.businessId
        },
        logo,
        onUploadProgress: (label, value) => {
          const progress = label ? { label, value } : null;
          this.setState({ progress });
        },
        success: uploadError => {
          this.setState({ loading: false });
          if (uploadError) {
            message.error('Logo upload failed!');
          }
          message.success('Business saved successfully!');
        },
        fail: ({ data }) => {
          this.setState({ loading: false });
          helper.setErrors(form, data, values);
        }
      });
    });
  };

  render() {
    const { business, loading, progress, logo } = this.state;
    const { error, form } = this.props;
    const { getFieldDecorator } = form;
    const creditsLabel = (business || {}).id
      ? `${business.tokens} Credit${business.tokens !== 1 ? 's' : ''}`
      : `${DATA.initTokens.tokens} free credits`;

    return (
      <Wrapper>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs/business">Businesses</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{business ? (business.id ? 'Edit' : 'Add') : ''}</Breadcrumb.Item>
        </Breadcrumb>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          <Form>
            <Item label="Name">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: 'Please input business name!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(<Input />)}
            </Item>

            <Item label="Credits">
              <div>{creditsLabel}</div>
              {(business || {}).id && <Button onClick={this.addCredit}>Add Credits</Button>}
            </Item>

            <Item label="Logo">
              <ImageSelector url={logo.url} removable={logo.exist} onChange={this.setLogo} />
            </Item>

            <div className="ant-form-item">
              <div className="ant-form-item-label" />
              <div className="ant-form-item-control-wrapper subimt-field">
                <Button type="primary" loading={loading} onClick={this.save}>
                  Save
                </Button>

                <Button onClick={this.goBuisinessList}>Cancel</Button>
              </div>
            </div>
          </Form>
        )}

        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    businesses: state.rc_businesses.businesses,
    error: state.rc_businesses.error
  }),
  {
    updateStatus,
    getBusinesses,
    saveBusiness
  }
)(Form.create()(BusinessEdit));
