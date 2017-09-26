import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { Loading } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import SelectBusiness from './SelectBusiness/SelectBusiness';
import styles from './Credits.scss';

@connect(
  () => ({
  }),
  { ...apiActions }
)
export default class Credits extends Component {
  static propTypes = {
    getUserBusinessesAction: PropTypes.func.isRequired,
    purchaseAction: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { };
  }

  componentDidMount() {
    this.props.getUserBusinessesAction()
    .then(businesses => {
      let businessId;
      try {
        businessId = JSON.parse(this.props.params.status);
      } catch (e) {
        businessId = 0;
      }
      this.setState({
        businesses,
        selectedBusiness: businesses[businessId]
      });
      // setTimeout(() => this.setState({
      //   businesses,
      //   selectedBusiness: businesses[businessId] || businesses[0]
      // }), 1000);
    });
  }

  onShowBusinesses = show => this.setState({
    dialog: show
  });

  onSelectedBusiness = selectedBusiness => this.setState({
    selectedBusiness
  });

  onPurchase = product => {
    const { selectedBusiness } = this.state;
    if (selectedBusiness) {
      this.props.purchaseAction({
        product_code: product.product_code,
        business: selectedBusiness.id
      })
      .then(data => {
        window.location.href = data.approval_url;
      });
    }
  }

  renderBusiness = () => {
    const { selectedBusiness } = this.state;
    const image = utils.getBusinessLogo(selectedBusiness, true);
    const tokens = selectedBusiness.tokens;
    const strTokens = `${tokens} Credit${tokens !== 1 ? 's' : ''}`;

    return (
      <Link
        className={[styles.business, 'shadow-board'].join(' ')}
        onClick={() => this.onShowBusinesses(true)}>
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.name}>{selectedBusiness.name}</div>
            <div className={styles.tokens}>{strTokens}</div>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    if (!this.state.businesses) {
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
            <div className="shadow-board">
              {
                ApiClient.products.map(product => (
                  <div className={styles.product} key={product.product_code}>
                    <div className={styles.credits}>{`${product.tokens} Credits`}</div>
                    <div className={styles.price}>{`£ ${product.price}`}</div>
                    <Button
                      bsStyle="success"
                      onClick={() => this.onPurchase(product)}
                    >Purchase</Button>
                  </div>
                ))
              }
            </div>
          </div>

          {
            this.state.dialog &&
            <SelectBusiness
              businesses={this.state.businesses}
              selectedBusiness={this.state.selectedBusiness}
              onSelected={this.onSelectedBusiness}
              onClose={() => this.onShowBusinesses(false)}
            />
          }
        </div>
      </div>
    );
  }
}
