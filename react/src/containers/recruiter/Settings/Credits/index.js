import React from 'react';
import { connect } from 'react-redux';
import { Select, Button, List } from 'antd';
import { Logo } from 'components';

import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { updateStatus, getBusinesses, purchase } from 'redux/recruiter/businesses';
import { Wrapper } from './Wrapper';

const Option = Select.Option;

class Credits extends React.Component {
  state = {
    businessId: null,
    loading: false
  };

  componentWillMount() {
    if (this.props.businesses.length) {
      this.getBusiness();
    } else {
      this.props.getBusinesses({
        success: this.getBusiness
      });
    }
  }

  getBusiness = () => {
    const { match, businesses } = this.props;
    const businessId = helper.str2int(match.params.businessId) || helper.loadData('credits/businessId');
    const business = helper.getItemByID(businesses, businessId) || businesses[0];
    this.selectBusiness(business.id);
  };

  selectBusiness = businessId => {
    const { businesses, updateStatus, history } = this.props;
    const { tokens } = helper.getItemByID(businesses, businessId);
    updateStatus({ credits: tokens });
    helper.saveData('credits/businessId', businessId);
    this.setState({ businessId });
    history.replace(`/recruiter/settings/credits/${businessId}`);
  };

  purchase = product => {
    const { businessId } = this.state;

    this.setState({ loading: true });

    this.props.purchase({
      data: {
        product_code: product.product_code,
        business: businessId
      },
      success: ({ approval_url }) => (window.location.href = approval_url),
      fail: () => this.setState({ loading: false })
    });
  };

  render() {
    const { businessId, loading } = this.state;
    return (
      <Wrapper>
        <Select size="large" value={businessId} onChange={this.selectBusiness}>
          {this.props.businesses.map(b => {
            const logo = helper.getBusinessLogo(b);
            const n = b.tokens;
            return (
              <Option key={b.id} value={b.id}>
                <Logo src={logo} className="logo" size="22px" />
                {b.name}
                <span className="credits">{`(${n} credit${n !== 1 ? 's' : ''})`}</span>
              </Option>
            );
          })}
        </Select>

        <List
          itemLayout="horizontal"
          dataSource={DATA.paypalProducts}
          loading={loading}
          renderItem={product => (
            <List.Item
              actions={[
                <Button type="primary" onClick={() => this.purchase(product)}>
                  Purchase
                </Button>
              ]}
            >
              <div className="credits">{`${product.tokens} Credits`}</div>
              <div>{`£ ${product.price}`}</div>
            </List.Item>
          )}
        />
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    businesses: state.rc_businesses.businesses
  }),
  {
    updateStatus,
    getBusinesses,
    purchase
  }
)(Credits);
