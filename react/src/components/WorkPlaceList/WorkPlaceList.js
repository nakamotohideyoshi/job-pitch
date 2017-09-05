import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropBox, JobItem } from 'components';
import WorkPlaceEdit from 'components/WorkPlaceEdit/WorkPlaceEdit';
import * as jobmanagerActions from 'redux/modules/jobmanager';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';

@connect(
  (state) => ({
    selectedBusiness: state.jobmanager.selectedBusiness,
    workplaces: state.jobmanager.workplaces,
    selectedWorkPlace: state.jobmanager.selectedWorkPlace,
  }),
  { ...jobmanagerActions, ...commonActions }
)
export default class WorkPlaces extends Component {
  static propTypes = {
    selectedBusiness: PropTypes.object,
    workplaces: PropTypes.array.isRequired,
    selectedWorkPlace: PropTypes.object,
    getUserBusinesses: PropTypes.func.isRequired,
    getUserWorkPlaces: PropTypes.func.isRequired,
    deleteUserWorkPlace: PropTypes.func.isRequired,
    selectWorkPlace: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
  }

  static defaultProps = {
    selectedBusiness: null,
    selectedWorkPlace: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      editWorkplace: null,
    };
  }

  componentDidMount() {
    if (this.props.selectedBusiness) {
      this.onRefresh();
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedBusiness } = this.props;
    const prevB = prevProps.selectedBusiness;
    if (selectedBusiness === prevB) return;
    if (selectedBusiness && prevB && selectedBusiness.id === prevB.id) {
      const id1 = selectedBusiness.images[0] ? selectedBusiness.images[0].id : -1;
      const id2 = prevB.images[0] ? prevB.images[0].id : -1;
      if (id1 === id2) return;
    }
    this.onRefresh();
  }

  onFilter = (option, index, collection, searchTerm) => option.name.toLowerCase().indexOf(searchTerm) > -1;

  onRefresh = newSelect => {
    const { selectedBusiness, getUserWorkPlaces } = this.props;
    getUserWorkPlaces(selectedBusiness.id, newSelect);
  }

  onAdd = () => this.setState({ editWorkplace: {} });

  onEdit = () => this.setState({ editWorkplace: this.props.selectedWorkPlace });

  onDelete = () => {
    const { selectedBusiness, getUserBusinesses, selectedWorkPlace, deleteUserWorkPlace, alertShow } = this.props;
    alertShow(
      'Confirm',
      `Are you sure you want to delete ${selectedWorkPlace.name}`,
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => deleteUserWorkPlace(selectedWorkPlace.id).then(() => {
            utils.successNotif('Deleted!');
            getUserBusinesses(selectedBusiness);
            this.onRefresh();
          })
        }
      ]
    );
  }

  dismissEdit = (workplace) => {
    if (workplace) {
      this.onRefresh(workplace);
      if (!this.state.editWorkplace.id) {
        const { selectedBusiness, getUserBusinesses } = this.props;
        getUserBusinesses(selectedBusiness);
      }
    }
    this.setState({ editWorkplace: null });
  }

  renderItem = workplace => {
    const image = utils.getWorkPlaceLogo(workplace, true);
    const count = workplace.jobs.length;
    return (
      <JobItem
        key={workplace.id}
        image={image}
        name={workplace.name}
        comment={` Includes ${count} job${count !== 1 ? 's' : ''}`}
      />
    );
  };

  render() {
    const { selectedBusiness, selectedWorkPlace, workplaces, selectWorkPlace } = this.props;
    const { editWorkplace } = this.state;
    return (
      <div>
        <DropBox
          headerLabel="Workplace"
          placeholder={selectedBusiness ? 'You have not added any workplaces yet' : ''}
          dataSource={workplaces}
          initialValue={selectedWorkPlace}
          onRefresh={selectedBusiness ? this.onRefresh : null}
          onAdd={selectedBusiness ? this.onAdd : null}
          onEdit={selectedWorkPlace ? this.onEdit : null}
          onDelete={selectedWorkPlace ? this.onDelete : null}
          onChange={selectWorkPlace}
          customOptionTemplateFunction={this.renderItem}
          customFilterFunction={this.onFilter}
          disabled={!selectedBusiness}
        />
        {
          editWorkplace && (
            <WorkPlaceEdit
              workplace={editWorkplace}
              onClose={this.dismissEdit}
            />
          )
        }
      </div>
    );
  }
}
