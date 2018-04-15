import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Button, notification } from 'antd';

import { saveBusiness } from 'redux/recruiter/businesses';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PopupProgress, ImageSelector, NoLabelField } from 'components';
import StyledForm from './styled';

const { Item } = Form;

class BusinessEdit extends React.Component {
  state = {
    logo: {
      url: null,
      file: null,
      exist: false
    },
    loading: null
  };

  componentDidMount() {
    const { business, form } = this.props;

    if (business) {
      this.setState({
        logo: {
          url: helper.getBusinessLogo(business),
          exist: (business.images || []).length > 0
        }
      });

      form.setFieldsValue({
        name: business.name
      });
    } else {
      this.setState({
        logo: {
          url: helper.getBusinessLogo(),
          exist: false
        }
      });
    }
  }

  setLogo = (file, url) =>
    this.setState({
      logo: {
        url: url || helper.getBusinessLogo(),
        file,
        exist: !!file
      }
    });

  addCredit = () => {
    const { business: { id }, history } = this.props;
    history.push(`/recruiter/settings/credits/${id}`);
  };

  goBuisinessList = () => {
    this.props.history.push('/recruiter/jobs/business');
  };

  save = () => {
    const { form, business, saveBusiness } = this.props;

    form.validateFieldsAndScroll({ scroll: { offsetTop: 70 } }, (err, values) => {
      if (err) return;

      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      saveBusiness({
        data: {
          ...values,
          id: (business || {}).id
        },
        logo: this.state.logo,
        onSuccess: msg => {
          notification.success({
            message: 'Notification',
            description: msg
          });
          this.goBuisinessList();
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
    const { business, form } = this.props;
    const { getFieldDecorator } = form;
    const creditsLabel = (business || {}).id
      ? `${business.tokens} Credit${business.tokens !== 1 ? 's' : ''}`
      : `${DATA.initTokens.tokens} free credits`;

    return (
      <Fragment>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs/business">Businesses</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{business ? 'Edit' : 'Add'}</Breadcrumb.Item>
        </Breadcrumb>

        <div className="content">
          <StyledForm>
            <Item label="Name">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: 'Please input business name!' },
                  { whitespace: true, message: 'This field may not be blank.' }
                ]
              })(<Input autoFocus />)}
            </Item>

            <Item label="Credits">
              <div>{creditsLabel}</div>
              {(business || {}).id && <Button onClick={this.addCredit}>Add Credits</Button>}
            </Item>

            <Item label="Logo">
              <ImageSelector url={logo.url} removable={logo.exist} onChange={this.setLogo} />
            </Item>

            <NoLabelField className="subimt-field">
              <Button type="primary" onClick={this.save}>
                Save
              </Button>
              <Button onClick={this.goBuisinessList}>Cancel</Button>
            </NoLabelField>
          </StyledForm>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Fragment>
    );
  }
}

export default connect(
  (state, { match }) => {
    const businessId = parseInt(match.params.businessId, 10);
    const business = helper.getItemByID(state.rc_businesses.businesses, businessId);
    return {
      business
    };
  },
  {
    saveBusiness
  }
)(Form.create()(BusinessEdit));
