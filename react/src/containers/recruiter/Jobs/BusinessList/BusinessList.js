import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/lib/Button';
import { ItemList, Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import _ from 'lodash';
import BusinessEdit from './BusinessEdit';
import styles from './BusinessList.scss';

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class BusinessList extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    selectedId: PropTypes.number,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    selectedId: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      firstTime: utils.getShared('first-time')
    };
    this.api = ApiClient.shared();
    this.props.parent.businessList = this;
  }

  componentDidMount() {
    this.onRefresh();
  }

  onGetStart = () => {
    utils.setShared('first-time', '2');
    this.setState({ firstTime: '2' });
    this.onAdd();
  }

  onRefresh = () => {
    this.setState({ businesses: null });
    this.api.getUserBusinesses('')
      .then(businesses => this.setState({ businesses }));
  }

  onFilter = (business, filterText) => business.name.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    this.setState({ editingBusiness: {} });
  }

  onEdit = (business, event) => {
    this.setState({ editingBusiness: business });

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (business, event) => {
    this.props.alertShow(
      'Confirm',
      `Are you sure you want to delete ${business.name}`,
      [
        {
          label: 'Delete',
          style: 'success',
          callback: () => {
            business.loading = true;
            this.setState({ businesses: this.state.businesses });

            this.api.deleteUserBusiness(business.id).then(
              () => {
                _.remove(this.state.businesses, item => item.id === business.id);
                this.setState({ businesses: this.state.businesses });

                if (this.props.selectedId === business.id) {
                  this.props.parent.onSelectedBusiness();
                }

                utils.successNotif('Deleted!');
              },
              () => {
                business.loading = false;
                this.setState({ businesses: this.state.businesses });
              }
            );
          }
        },
        { label: 'Cancel' },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  }

  renderItem = business => {
    // check loading
    if (business.loading) {
      return (
        <div
          key={business.id}
          className={styles.business}
        >
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const image = utils.getBusinessLogo(business, true);
    const count = business.locations.length;
    const strCount = ` Includes ${count} workplace${count !== 1 ? 's' : ''}`;
    const selected = this.props.selectedId === business.id ? styles.selected : '';
    return (
      <Link
        key={business.id}
        className={[styles.business, selected].join(' ')}
        onClick={() => this.props.parent.onSelectedBusiness(business.id)}>
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.name}>{business.name}</div>
            <div className={styles.comment}>{strCount}</div>
          </div>
          <div className={styles.controls}>
            <Button
              bsStyle="success"
              onClick={e => this.onEdit(business, e)}
            >Edit</Button>
            <Button
              disabled={this.state.businesses.length === 1}
              onClick={e => this.onRemove(business, e)}
            >Remove</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => {
    if (this.state.firstTime === '1') {
      return (
        <div>
          <span>
            Hi, Welcome to My Job Pitch <br />
            Let's start by easily adding your business!
          </span>
          <br />
          <button className="link-btn" onClick={this.onGetStart}>Get started!</button>
        </div>
      );
    }

    return (
      <div>
        <span>
          {
            `You have not added any
             businesses yet.`
          }
        </span>
        <br />
        <button className="link-btn" onClick={this.onAdd}>Create business</button>
      </div>
    );
  };

  render() {
    const { editingBusiness } = this.state;
    return (
      <div className="board-shadow">
        {
          editingBusiness ?
            <BusinessEdit
              business={editingBusiness}
              parent={this}
            /> :
            <ItemList
              items={this.state.businesses}
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
