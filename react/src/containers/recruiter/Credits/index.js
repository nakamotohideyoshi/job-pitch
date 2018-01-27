import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Container, Button } from 'reactstrap';
import { Loading, Board, PageHeader } from 'components';

import * as api from 'utils/api';
import { SDATA } from 'utils/data';
import { getBusinesses } from 'redux/recruiter/businesses';
import BusinessSelect from './BusinessSelect';
import Wrapper from './Wrapper';

class Credits extends Component {
  state = {};

  componentWillMount() {
    this.props.getBusinesses();
  }

  componentWillReceiveProps(nextProps) {
    const { businesses } = nextProps;

    if (businesses) {
      const businessId = parseInt(this.props.match.params.businessId, 10);

      let selectedBusiness = businesses.filter(business => business.id === businessId)[0];

      if (!selectedBusiness) {
        selectedBusiness = businesses[0];
      }
      this.setState({ selectedBusiness });
    }
  }

  onSelectBusiness = selectedBusiness => this.setState({ selectedBusiness });

  onPurchase = product => {
    const { selectedBusiness } = this.state;
    if (selectedBusiness) {
      this.setState({ [product.product_code]: true });

      api
        .post('/api/paypal/purchase/', {
          product_code: product.product_code,
          business: selectedBusiness.id
        })
        .then(
          data => {
            window.location.href = data.approval_url;
          },
          () => {
            this.setState({ [product.product_code]: false });
          }
        );
    }
  };

  renderPuchaseButton = product => {
    const loading = this.state[product.product_code];
    const loadingClass = loading ? 'loading' : '';
    return (
      <div className={['product', loadingClass].join(' ')} key={product.product_code}>
        <div className="credits">{`${product.tokens} Credits`}</div>
        <div className="price">{`£ ${product.price}`}</div>
        <Button color="green" onClick={() => this.onPurchase(product)} disabled={loading}>
          Purchase
        </Button>

        {loading && <span className="mask" />}
        {loading && <Loading />}
      </div>
    );
  };

  render() {
    const { businesses } = this.props;
    const { selectedBusiness } = this.state;

    return (
      <Wrapper>
        <Helmet title="Add Credit" />

        {businesses ? (
          <Container>
            <PageHeader>Add Credit</PageHeader>

            <BusinessSelect
              valueKey="id"
              labelKey="name"
              clearable={false}
              options={businesses}
              value={selectedBusiness}
              onChange={this.onSelectBusiness}
            />

            <Board block className="board">
              {SDATA.paypalProducts.map(this.renderPuchaseButton)}
            </Board>
          </Container>
        ) : (
          <Loading />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    businesses: state.rc_businesses.businesses
  }),
  {
    getBusinesses
  }
)(Credits);
