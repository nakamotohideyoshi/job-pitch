import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Form, Input, Button, notification } from 'antd';

import { getBusinesses } from 'redux/selectors';
import { saveBusiness, selectBusiness } from 'redux/recruiter/businesses';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, PopupProgress, ImageSelector, NoLabelField } from 'components';
import Wrapper from '../styled';

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
    const { business, form, selectBusiness } = this.props;

    if (business) {
      selectBusiness(business.id);
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
    this.props.history.push(`/recruiter/settings/credits/${this.props.business.id}`);
  };

  goBuisinessList = () => {
    this.props.history.push('/recruiter/jobs/business');
  };

  save = () => {
    const { form, business, saveBusiness, history } = this.props;

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
        onSuccess: ({ id }) => {
          notification.success({
            message: 'Success',
            description: 'The business is saved'
          });
          if (business) {
            this.goBuisinessList();
          } else {
            history.push(`/recruiter/jobs/workplace/${id}`);
          }
        },
        onFail: error => {
          this.setState({ loading: null });
          notification.error({
            message: 'Error',
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

    const title = business ? 'Edit' : 'Add';

    return (
      <Wrapper className="container">
        <Helmet title={`${title} Business`} />

        <PageHeader>
          <h2>{title} Business</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        <div className="content">
          <Form>
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
          </Form>
        </div>

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemByID(getBusinesses(state), businessId);
    return {
      business
    };
  },
  {
    saveBusiness,
    selectBusiness
  }
)(Form.create()(BusinessEdit));
