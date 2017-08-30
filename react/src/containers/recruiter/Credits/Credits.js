import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PaypalExpressBtn from 'react-paypal-express-checkout';
import BusinessList from 'components/BusinessList/BusinessList';
import { JobItem } from 'components';
import * as utils from 'helpers/utils';
import styles from './Credits.scss';

export default class Credits extends Component {

  onSuccess = (payment, plan) => {
    // Congratulation, it came here means everything's fine!
    console.log('The payment was succeeded!', payment, plan);
    utils.successNotif('The payment was succeeded!');
    // payment.payerID, payment.paymentID, payment.paymentToken
  }

  onError = (err) => {
    console.log('Error!', err);
    utils.errorNotif('Payment Error!');
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
    const client = {
      sandbox: 'AcFQJfacbVGOsuGNqLjU7mFAzPKfMf3ZHC403WF4jVuxlNxxGCJiu3ZLl_Z0tKnO6YGUNcjdUJYSkrCy',
      // production: 'YOUR-PRODUCTION-APP-ID',
    };
    const plans = [
      { credits: 20, price: 20 },
      { credits: 40, price: 40 }
    ];
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
              plans.map(plan => (
                <div className={styles.planBox} key={plan.credits}>
                  <div className={styles.credits}>{`${plan.credits} Credits`}</div>
                  <div className={styles.price}>{`€ ${plan.price}`}</div>
                  <PaypalExpressBtn
                    env="sandbox"
                    client={client}
                    currency={'EUR'}
                    total={plan.price}
                    onSuccess={event => this.onSuccess(event, plan)}
                    onError={this.onError}
                  />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    );
  }
}
