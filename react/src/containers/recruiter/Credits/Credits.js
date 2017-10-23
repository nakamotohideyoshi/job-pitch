import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import { Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import SelectBusiness from './SelectBusiness';
import styles from './Credits.scss';

export default class Credits extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.api.getUserBusinesses('').then(
      businesses => {
        this.setState({ businesses });

        const businessId = parseInt(utils.getShared('credits_business_id'), 10);
        if (businessId !== 0 && !businessId) {
          this.onSelectedBusiness(businesses[0]);
        } else {
          const business = businesses.filter(item => item.id === businessId)[0];
          this.onSelectedBusiness(business);
        }
      }
    );
  }

  onShowBusinesses = show => this.setState({
    dialog: show
  });

  onSelectedBusiness = selectedBusiness => {
    utils.setShared('credits_business_id', (selectedBusiness || {}).id);
    this.setState({ selectedBusiness });
  };

  onPurchase = product => {
    const { selectedBusiness } = this.state;
    if (selectedBusiness) {
      this.setState({ [product.product_code]: true });

      this.api.purchase({
        product_code: product.product_code,
        business: selectedBusiness.id
      }).then(
        data => {
          window.location.href = data.approval_url;
        },
        () => {
          this.setState({ [product.product_code]: false });
        }
      );
    }
  }

  renderBusiness = () => {
    const { selectedBusiness } = this.state;
    const image = utils.getBusinessLogo(selectedBusiness, true);
    const tokens = selectedBusiness.tokens;
    const strTokens = `${tokens} Credit${tokens !== 1 ? 's' : ''}`;

    return (
      <Link
        className={[styles.business, 'board-shadow'].join(' ')}
        onClick={() => this.onShowBusinesses(true)}
      >
        <img src={image} alt="" />
        <div className={styles.content} >
          <div className={styles.name}>{selectedBusiness.name}</div>
          <div className={styles.tokens}>{strTokens}</div>
        </div>
      </Link>
    );
  };

  renderPuchaseButton = product => {
    const loading = this.state[product.product_code];
    const loadingClass = loading ? styles.loading : '';
    return (
      <div className={[styles.product, loadingClass].join(' ')} key={product.product_code}>
        <div className={styles.credits}>{`${product.tokens} Credits`}</div>
        <div className={styles.price}>{`£ ${product.price}`}</div>
        <Button
          bsStyle="success"
          onClick={() => this.onPurchase(product)}
          disabled={loading}
        >Purchase</Button>

        {
          loading &&
          <Loading
            size="30px"
            color="#fff"
            backgroundColor="rgba(0,0,0,0.5)"
          />
        }
      </div>
    );
  };

  render() {
    if (!this.state.businesses || !this.state.selectedBusiness) {
      return <Loading />;
    }

    return (
      <div className={styles.root}>
        <Helmet title="Add Credit" />

        <div className="container">
          <div className="pageHeader">
            <h3>Add Credit</h3>
          </div>

          { this.renderBusiness() }

          <div className={styles.products}>
            <div className="board-shadow">
              {
                this.api.products.map(this.renderPuchaseButton)
              }
            </div>
          </div>

          {
            this.state.dialog &&
            <SelectBusiness
              businesses={this.state.businesses}
              selectedBusiness={this.state.selectedBusiness}
              onClose={() => this.onShowBusinesses(false)}
              parent={this}
            />
          }
        </div>
      </div>
    );
  }
}
