import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropBox, JobItem } from 'components';
import JobEdit from 'components/JobEdit/JobEdit';
import * as jobmanagerActions from 'redux/modules/jobmanager';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import _ from 'lodash';

@connect(
  (state) => ({
    staticData: state.auth.staticData,
    selectedWorkPlace: state.jobmanager.selectedWorkPlace,
    jobs: state.jobmanager.jobs,
    selectedJob: state.jobmanager.selectedJob,
  }),
  { ...jobmanagerActions, ...commonActions }
)
export default class Jobs extends Component {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    selectedWorkPlace: PropTypes.object,
    jobs: PropTypes.array.isRequired,
    selectedJob: PropTypes.object,
    saveUserJob: PropTypes.func.isRequired,
    getUserWorkPlaces: PropTypes.func.isRequired,
    getUserJobsByWorkPlace: PropTypes.func.isRequired,
    deleteUserJob: PropTypes.func.isRequired,
    selectJob: PropTypes.func.isRequired,
    alertShow: PropTypes.func.isRequired,
  }

  static defaultProps = {
    selectedWorkPlace: null,
    selectedJob: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      editJob: null,
    };
  }

  componentDidUpdate(prevProps) {
    const { selectedWorkPlace } = this.props;
    const prevWP = prevProps.selectedWorkPlace;
    if (selectedWorkPlace === prevWP) return;
    if (selectedWorkPlace && prevWP && selectedWorkPlace.id === prevWP.id) {
      let id1 = selectedWorkPlace.images[0] ? selectedWorkPlace.images[0].id : -1;
      let id2 = prevWP.images[0] ? prevWP.images[0].id : -1;
      if (id1 === id2) {
        const b1 = selectedWorkPlace.business_data;
        const b2 = prevWP.business_data;
        id1 = b1.images[0] ? b1.images[0].id : -1;
        id2 = b2.images[0] ? b2.images[0].id : -1;
        if (id1 === id2) return;
      }
    }
    this.onRefresh();
  }

  onFilter = (option, index, collection, searchTerm) => option.title.toLowerCase().indexOf(searchTerm) > -1;

  onRefresh = newSelect => {
    const { selectedWorkPlace, getUserJobsByWorkPlace } = this.props;
    getUserJobsByWorkPlace(selectedWorkPlace.id, newSelect);
  }

  onAdd = () => this.setState({ editJob: {} });

  onEdit = () => this.setState({ editJob: this.props.selectedJob });

  onDelete = () => {
    const { selectedWorkPlace, getUserWorkPlaces, selectedJob, deleteUserJob, alertShow } = this.props;
    alertShow(
      'Delete/deactivate',
      'Are you sure?',
      [
        { label: 'Cancel' },
        {
          label: 'Delete',
          style: 'success',
          callback: () => deleteUserJob(selectedJob.id).then(() => {
            utils.successNotif('Deleted!');
            getUserWorkPlaces(selectedWorkPlace.business_data.id, selectedWorkPlace);
            this.onRefresh();
          })
        },
        {
          label: 'Deactivate',
          style: 'success',
          callback: () => this.deactiveJob().then(() => {
            utils.successNotif('Deactived!');
            this.onRefresh();
          })
        }
      ]
    );
  }

  deactiveJob = () => {
    const { staticData, selectedJob, saveUserJob } = this.props;
    const data = Object.assign(selectedJob);
    const i = _.findIndex(staticData.jobStatuses, { name: 'CLOSED' });
    data.status = staticData.jobStatuses[i].id;
    return saveUserJob(data);
  }

  dismissEdit = job => {
    if (job) {
      this.onRefresh(job);
      if (!this.state.editJob.id) {
        const { selectedWorkPlace, getUserWorkPlaces } = this.props;
        getUserWorkPlaces(selectedWorkPlace.business_data.id, selectedWorkPlace);
      }
    }
    this.setState({ editJob: null });
  }

  renderItem = job => {
    const image = utils.getJobLogo(job, true);
    return (
      <JobItem
        key={job.id}
        image={image}
        name={job.title}
        comment=""
      />
    );
  };

  render() {
    const { selectedWorkPlace, selectedJob, jobs, selectJob } = this.props;
    const { editJob } = this.state;
    return (
      <div>
        <DropBox
          headerLabel="Job"
          placeholder={selectedWorkPlace ? 'You have not added any jobs yet' : ''}
          dataSource={jobs}
          initialValue={selectedJob}
          onRefresh={selectedWorkPlace ? this.onRefresh : null}
          onAdd={selectedWorkPlace ? this.onAdd : null}
          onEdit={selectedJob ? this.onEdit : null}
          onDelete={selectedJob ? this.onDelete : null}
          onChange={selectJob}
          customOptionTemplateFunction={this.renderItem}
          customFilterFunction={this.onFilter}
          disabled={!selectedWorkPlace}
        />
        {
          editJob && (
            <JobEdit
              job={editJob}
              onClose={this.dismissEdit}
            />
          )
        }
      </div>
    );
  }
}
