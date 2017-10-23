import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import { ItemList, Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import BusinessEdit from './BusinessEdit';
import styles from './BusinessList.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class BusinessList extends Component {

  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    parent: PropTypes.object.isRequired,
    businesses: PropTypes.array,
    selectedId: PropTypes.number,
  }

  static defaultProps = {
    businesses: null,
    selectedId: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.manager = this.props.parent;
    this.manager.businessList = this;
    this.api = ApiClient.shared();
  }

  onFilter = (business, filterText) =>
    business.name.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    if (this.api.user.can_create_businesses || this.props.businesses.length === 0) {
      if (utils.getShared('first-time') === '1') {
        utils.setShared('first-time', '2');
      }

      this.setState({ editingData: {} });
      return;
    }

    this.props.alertShow(
      'More than one company?',
      'More than one company?\nGet in touch!',
      [
        { label: 'No' },
        {
          label: 'Contact Us',
          style: 'success',
          callback: () => browserHistory.push('/resources/contactus')
        },
      ]
    );
  }

  onRemove = (business, event) => {
    this.props.alertShow(
      'Confirm',
      `Are you sure you want to delete ${business.name}`,
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => this.manager.deleteBusiness(business)
        },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  }

  onEdit = (business, event) => {
    this.setState({ editingData: business });

    if (event) {
      event.stopPropagation();
    }
  }

  renderItem = business => {
    // check loading
    if (business.deleting) {
      return (
        <div key={business.id} className={styles.business}>
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const image = utils.getBusinessLogo(business, true);
    const workplaceCount = business.locations.length;
    const info = ` Includes ${workplaceCount} workplace${workplaceCount !== 1 ? 's' : ''}`;
    const selected = this.props.selectedId === business.id ? styles.selected : '';
    return (
      <Link
        key={business.id}
        className={[styles.business, selected].join(' ')}
        onClick={() => this.manager.selectBusiness(business.id)}
      >
        <img src={image} alt="" />
        <div className={styles.content} >
          <div className={styles.name}>{business.name}</div>
          <div className={styles.info}>{info}</div>
        </div>
        <div className={styles.controls}>
          <Button
            bsStyle="success"
            onClick={e => this.onEdit(business, e)}
          >Edit</Button>
          <Button
            disabled={this.props.businesses.length === 1}
            onClick={e => this.onRemove(business, e)}
          >Remove</Button>
        </div>
      </Link>
    );
  };

  renderEmpty = () => {
    const firstTime = utils.getShared('first-time') === '1';
    return (
      <div>
        <span>
          {
            firstTime ?
              `Hi, Welcome to My Job Pitch
                Let's start by easily adding your business!`
            :
              `You have not added any
                businesses yet.`
          }
        </span>
        <button className="link-btn" onClick={this.onAdd}>
          {
            firstTime ? 'Get started!' : 'Create business'
          }
        </button>
      </div>
    );
  }

  render() {
    const { editingData } = this.state;
    return (
      <div className="board-shadow">
        {
          editingData ?
            <BusinessEdit
              parent={this}
              business={editingData}
            />
          :
            <ItemList
              items={this.props.businesses}
              onFilter={this.onFilter}
              buttons={[
                { label: 'New Business', bsStyle: 'success', onClick: this.onAdd }
              ]}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />
        }
      </div>
    );
  }
}
