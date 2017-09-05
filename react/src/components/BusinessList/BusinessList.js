import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropBox } from 'components';
import BusinessEdit from 'components/BusinessEdit/BusinessEdit';
import * as jobmanagerActions from 'redux/modules/jobmanager';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';

@connect(
  (state) => ({
    user: state.auth.user,
    businesses: state.jobmanager.businesses,
    selectedBusiness: state.jobmanager.selectedBusiness,
  }),
  { ...jobmanagerActions, ...commonActions }
)
export default class Businesses extends Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    businesses: PropTypes.array.isRequired,
    selectedBusiness: PropTypes.object,
    getUserBusinesses: PropTypes.func.isRequired,
    deleteUserBusiness: PropTypes.func.isRequired,
    selectBusiness: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
  }

  static defaultProps = {
    selectedBusiness: null,
    readOnly: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      editBusiness: null,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onFilter = (option, index, collection, searchTerm) => option.name.toLowerCase().indexOf(searchTerm) > -1;

  onRefresh = newSelect => {
    this.props.getUserBusinesses(newSelect)
      .then(() => this.setState({ loaded: true }));
  }

  onAdd = () => {
    const { businesses, user, alertShow } = this.props;
    if (businesses.length > 0 && !user.can_create_businesses) {
      alertShow(
        'Alert',
        'Have more than one company?',
        [
          { label: 'No' },
          { label: 'Yes', style: 'success' }
        ]
      );
    } else {
      this.setState({ editBusiness: {} });
    }
  }

  onEdit = () => this.setState({ editBusiness: this.props.selectedBusiness });

  onDelete = () => {
    const { selectedBusiness, deleteUserBusiness, alertShow } = this.props;
    alertShow(
      'Confirm',
      `Are you sure you want to delete ${selectedBusiness.name}`,
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => deleteUserBusiness(selectedBusiness.id)
            .then(() => {
              utils.successNotif('Deleted!');
              this.onRefresh();
            })
        }
      ]
    );
  }

  dismissEdit = (business) => {
    if (business) {
      this.onRefresh(business);
    }
    this.setState({ editBusiness: null });
  }

  render() {
    const { user, selectedBusiness, businesses, selectBusiness, readOnly, renderItem } = this.props;
    const { editBusiness, loaded } = this.state;
    return (
      <div>
        <DropBox
          headerLabel="Business"
          dataSource={businesses}
          initialValue={selectedBusiness}
          onRefresh={this.onRefresh}
          onAdd={this.onAdd}
          onEdit={selectedBusiness ? this.onEdit : null}
          onDelete={selectedBusiness && user && (user.businesses.length > 1 ? this.onDelete : null)}
          onChange={selectBusiness}
          customOptionTemplateFunction={renderItem}
          customFilterFunction={this.onFilter}
          disabled={!loaded}
          readOnly={readOnly}
        />
        {
          editBusiness && (
            <BusinessEdit
              business={editBusiness}
              onClose={this.dismissEdit}
            />
          )
        }
      </div>
    );
  }
}
