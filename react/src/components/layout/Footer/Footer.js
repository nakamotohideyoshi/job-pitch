import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import { FormComponent } from 'components';
import { VERSION } from 'const';
import * as commonActions from 'redux/modules/common';
import styles from './Footer.scss';

const logoImage = require('assets/logo.png');

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class Footer extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
  };

  onClickItem = to => {
    if (FormComponent.needToSave) {
      this.props.alertShow(
        'Confirm',
        'You did not save your changes.',
        [
          { label: 'Cancel' },
          {
            label: 'Ok',
            style: 'success',
            callback: () => {
              FormComponent.needToSave = false;
              browserHistory.push(to);
            }
          },
        ]
      );
    } else {
      browserHistory.push(to);
    }
  }

  render() {
    return (
      <footer>
        <div className="container">
          <div className={styles.menu}>
            <Link onClick={() => this.onClickItem('/resources/about')}>About</Link>
            <Link onClick={() => this.onClickItem('/resources/help')}>Help</Link>
            <Link onClick={() => this.onClickItem('/resources/terms')}>Terms & Conditions</Link>
            <Link onClick={() => this.onClickItem('/resources/privacy')}>Privacy Policy</Link>
            <Link onClick={() => this.onClickItem('/resources/contactus')}>Contact Us</Link>
          </div>

          <div className={styles.follow}>
            <Link href="https://www.facebook.com/"><i className="fa fa-twitter fa-lg" /></Link>
            <Link href="https://twitter.com/"><i className="fa fa-facebook fa-lg" /></Link>
            <Link href="https://www.linkedin.com/"><i className="fa fa-linkedin fa-lg" /></Link>
          </div>

          <div className={styles.company}>
            <img src={logoImage} alt="" />
            @ 2017 Sclabs Ltd
            <span>({ VERSION })</span>
          </div>
        </div>
      </footer>
    );
  }
}
