import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { ItemList } from 'components';
import * as utils from 'helpers/utils';
import styles from './SelectBusiness.scss';

export default class SelectBusiness extends Component {
  static propTypes = {
    businesses: PropTypes.array.isRequired,
    selectedBusiness: PropTypes.object.isRequired,
    parent: PropTypes.object.isRequired
  }

  onFilter = (business, filterText) => business.name.toLowerCase().indexOf(filterText) > -1;

  onSelect = business => {
    this.props.parent.onSelectedBusiness(business);
    this.onClose();
  };

  onClose = () => this.props.parent.onShowBusinesses(false);

  renderItem = business => {
    const image = utils.getBusinessLogo(business, true);
    const tokens = business.tokens;
    const strTokens = `${tokens} Credit${tokens !== 1 ? 's' : ''}`;

    const selectedStyle = business.id === this.props.selectedBusiness.id ? styles.selected : '';

    return (
      <Link
        key={business.id}
        className={[styles.business, selectedStyle].join(' ')}
        onClick={() => this.onSelect(business)}>
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.name}>{business.name}</div>
            <div className={styles.tokens}>{strTokens}</div>
          </div>
        </div>
      </Link>
    );
  };

  render() {
    return (
      <Modal show onHide={this.onClose} bsStyle="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Businesses</Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.body}>
          <div className="board">
            <ItemList
              items={this.props.businesses}
              onFilter={this.onFilter}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />
          </div>
        </Modal.Body>

        <Modal.Footer className={styles.footer}>
          <Button
            type="button"
            onClick={this.onClose}
          >Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
