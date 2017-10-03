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
import WorkplaceEdit from './WorkplaceEdit';
import styles from './WorkplaceList.scss';

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class WorkplaceList extends Component {
  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    businessId: PropTypes.number,
    selectedId: PropTypes.number,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    businessId: null,
    selectedId: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
    this.props.parent.workplaceList = this;
  }

  componentWillReceiveProps(nextProps) {
    if (this.businessId !== nextProps.businessId) {
      this.businessId = nextProps.businessId;
      this.onRefresh();
    }
  }

  onRefresh = () => {
    this.setState({ workplaces: null, editingWorkplace: null });
    if (this.businessId) {
      this.api.getUserWorkplaces(`?business=${this.businessId}`)
        .then(workplaces => this.setState({ workplaces }));
    }
  }

  onFilter = (workplace, filterText) => workplace.name.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    if (this.businessId) {
      this.setState({
        editingWorkplace: { business: this.businessId }
      });
    }
  }

  onEdit = (event, workplace) => {
    this.setState({ editingWorkplace: workplace });

    if (event) {
      event.stopPropagation();
    }
  }

  onRemove = (event, workplace) => {
    this.props.alertShow(
      'Confirm',
      `Are you sure you want to delete ${workplace.name}`,
      [
        {
          label: 'Delete',
          style: 'success',
          callback: () => {
            workplace.loading = true;
            this.setState({ workplaces: this.state.workplaces });

            this.api.deleteUserWorkplace(workplace.id).then(
              () => {
                _.remove(this.state.workplaces, item => item.id === workplace.id);
                this.setState({ workplaces: this.state.workplaces });

                if (this.props.selectedId === workplace.id) {
                  this.props.parent.onSelectedWorkplace();
                }

                utils.successNotif('Deleted!');
              },
              () => {
                workplace.loading = false;
                this.setState({ workplaces: this.state.workplaces });
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

  renderItem = workplace => {
    // check loading
    if (workplace.loading) {
      return (
        <div
          key={workplace.id}
          className={styles.workplace}
        >
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const image = utils.getWorkplaceLogo(workplace, true);
    const count = workplace.jobs.length;
    const strCount = ` Includes ${count} job${count !== 1 ? 's' : ''}`;
    const selected = this.props.selectedId === workplace.id ? styles.selected : '';
    return (
      <Link
        key={workplace.id}
        className={[styles.workplace, selected].join(' ')}
        onClick={() => this.props.parent.onSelectedWorkplace(workplace.id)}>
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.name}>{workplace.name}</div>
            <div className={styles.comment}>{strCount}</div>
          </div>
          <div className={styles.controls}>
            <Button
              bsStyle="success"
              onClick={e => this.onEdit(e, workplace)}
            >Edit</Button>
            <Button
              onClick={e => this.onRemove(e, workplace)}
            >Remove</Button>
          </div>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <div>
      <span>
        {
          `You have not added any
           workplaces yet.`
        }
      </span>
      <br />
      <button className="link-btn" onClick={this.onAdd}>Create workplace</button>
    </div>
  );

  render() {
    if (!this.businessId) {
      return (
        <div className="board-shadow">
        </div>
      );
    }

    const { editingWorkplace } = this.state;
    return (
      <div className="board-shadow">
        {
          editingWorkplace ?
            <WorkplaceEdit
              workplace={editingWorkplace}
              parent={this}
            /> :
            <ItemList
              items={this.state.workplaces}
              onFilter={this.onFilter}
              buttons={[
                { label: 'New Workplace', bsStyle: 'success', onClick: this.onAdd }
              ]}
              renderItem={this.renderItem}
              renderEmpty={this.renderEmpty}
            />
        }
      </div>
    );
  }
}
