import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import { ItemList, Loading, LogoImage } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import WorkplaceEdit from './WorkplaceEdit';
import styles from './WorkplaceList.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class WorkplaceList extends Component {

  static propTypes = {
    alertShow: PropTypes.func.isRequired,
    parent: PropTypes.object.isRequired,
    workplaces: PropTypes.array,
    selectedId: PropTypes.number,
  }

  static defaultProps = {
    workplaces: null,
    selectedId: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.manager = this.props.parent;
    this.manager.workplaceList = this;
    this.api = ApiClient.shared();
  }

  onFilter = (workplace, filterText) =>
    workplace.name.toLowerCase().indexOf(filterText) > -1;

  onAdd = () => {
    if (utils.getShared('first-time') === '2') {
      utils.setShared('first-time', '3');
    }

    this.setState({
      editingData: {
        business: this.manager.getBusinessId(),
        email: utils.getCookie('email'),
        email_public: true,
        mobile_public: true,
      }
    });
  }

  onRemove = (workplace, event) => {
    this.props.alertShow(
      'Confirm',
      `Are you sure you want to delete ${workplace.name}`,
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => this.manager.deleteWorkplace(workplace)
        },
      ]
    );

    if (event) {
      event.stopPropagation();
    }
  }

  onEdit = (workplace, event) => {
    this.setState({ editingData: workplace });

    if (event) {
      event.stopPropagation();
    }
  }

  renderItem = workplace => {
    // check loading
    if (workplace.deleting) {
      return (
        <div key={workplace.id} className={styles.workplace}>
          <div><Loading size="25px" /></div>
        </div>
      );
    }

    const image = utils.getWorkplaceLogo(workplace);
    const jobCount = workplace.jobs.length;
    const strJobCount = ` Includes ${jobCount} job${jobCount !== 1 ? 's' : ''}`;
    const closedConut = jobCount - workplace.active_job_count;
    const strClosedCount = `${closedConut} inactive`;
    const selected = this.props.selectedId === workplace.id ? 'selected' : '';
    return (
      <Link
        key={workplace.id}
        className={[styles.workplace, selected, 'list-item'].join(' ')}
        onClick={() => this.manager.selectWorkplace(workplace.id)}
      >
        <LogoImage image={image} />
        <div className="content">
          <h5>{workplace.name}</h5>
          <div>
            <span className={styles.jobCount}>{strJobCount}</span>
            <span className={styles.closedCount}>{strClosedCount}</span>
          </div>
        </div>
        <div className="controls">
          <Button
            bsStyle="success"
            onClick={e => this.onEdit(workplace, e)}
          >Edit</Button>
          <Button
            onClick={e => this.onRemove(workplace, e)}
          >Remove</Button>
        </div>
      </Link>
    );
  };

  renderEmpty = () => (
    <div>
      <span>
        {
          utils.getShared('first-time') === '2' ?
            `Great, you've created your business!
            Now let's create your work place`
          :
            'This business doesn\'t seem to have a workplace for your staff'
        }
      </span>
      <button className="link-btn" onClick={this.onAdd}>Create workplace</button>
    </div>
  );

  render() {
    const { editingData } = this.state;
    return (
      <div className="board shadow">
        {
          editingData ?
            <WorkplaceEdit
              parent={this}
              workplace={editingData}
            />
          :
            <ItemList
              items={this.props.workplaces}
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
