import React from 'react';
import { connect } from 'react-redux';
import { Select, Button, List } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { selectBusinessAction, purchaseAction } from 'redux/businesses';
import { Logo } from 'components';
import { Wrapper } from './styled';

const Option = Select.Option;

/* eslint-disable react/prop-types */
class Credits extends React.Component {
  state = {
    loading: false
  };

  componentWillMount() {
    const { business } = this.props;
    if (business) {
      this.props.selectBusinessAction(business.id);
    }
  }

  selectBusiness = businessId => {
    const { selectBusinessAction, history } = this.props;
    selectBusinessAction(businessId);
    helper.saveData('credits/businessId', businessId);
    history.replace(`/recruiter/settings/credits/${businessId}`);
  };

  purchase = product => {
    this.setState({ loading: true });

    this.props.purchaseAction({
      data: {
        product_code: product.product_code,
        business: this.props.business.id
      },
      success: ({ approval_url }) => (window.location.href = approval_url),
      fail: () => this.setState({ loading: false })
    });
  };

  render() {
    const { business, businesses } = this.props;
    const { loading } = this.state;
    return (
      <Wrapper>
        <Select value={business.id} onChange={this.selectBusiness}>
          {businesses.map(b => {
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
  (state, { match }) => {
    const businessId = helper.str2int(match.params.businessId) || helper.loadData('credits/businessId');
    const { businesses } = state.businesses;
    const business = helper.getItemById(businesses, businessId) || businesses[0];
    return {
      businesses,
      business
    };
  },
  {
    selectBusinessAction,
    purchaseAction
  }
)(Credits);
