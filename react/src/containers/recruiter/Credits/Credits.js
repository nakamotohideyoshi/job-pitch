import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import BusinessList from 'components/BusinessList/BusinessList';
import { JobItem } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Credits.scss';

@connect(
  (state) => ({
    staticData: state.auth.staticData,
    selectedBusiness: state.jobmanager.selectedBusiness,
  }),
  { ...commonActions }
)
export default class Credits extends Component {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    purchase: PropTypes.func.isRequired,
    selectedBusiness: PropTypes.object,
    params: PropTypes.object.isRequired,
  }

  static defaultProps = {
    selectedBusiness: null,
  }

  constructor(props) {
    super(props);
    console.log(this.props.params);
  }

  onPurchase = product => {
    const { selectedBusiness, purchase } = this.props;
    if (selectedBusiness) {
      purchase({
        product_code: product.product_code,
        business: selectedBusiness.id
      })
      .then(data => {
        window.location.href = data.approval_url;
      });
    }
  }

  renderBusiness = business => {
    const image = utils.getBusinessLogo(business, true);
    const tokens = business.tokens;
    return (
      <JobItem
        key={business.id}
        image={image}
        name={business.name}
        comment={`${tokens} Credit${tokens !== 1 ? 's' : ''}`}
      />
    );
  };

  render() {
    const products = this.props.staticData.products;

    return (
      <div>
        <Helmet title="Add Credit" />
        <div className="pageHeader">
          <h1>Add Credit</h1>
        </div>
        <div className="board">
          <BusinessList
            renderItem={this.renderBusiness}
            readOnly
          />
          <div className={styles.planContainer}>
            {
              products.map(product => (
                <div className={styles.planBox} key={product.product_code}>
                  <div className={styles.credits}>{`${product.tokens} Credits`}</div>
                  <div className={styles.price}>{`€ ${product.price}`}</div>
                  <Button
                    bsStyle="success"
                    onClick={() => this.onPurchase(product)}
                  >Purchase</Button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}
