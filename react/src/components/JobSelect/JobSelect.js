import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactSuperSelect from 'react-super-select';
import { JobItem } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import _ from 'lodash';
import styles from './JobSelect.scss';

@connect(
  (state) => ({
    shared: state.common.shared,
    staticData: state.auth.staticData,
  }),
  { ...commonActions }
)
export default class JobSelect extends Component {
  static propTypes = {
    shared: PropTypes.object.isRequired,
    staticData: PropTypes.object.isRequired,
    setData: PropTypes.func.isRequired,
    getUserJobs: PropTypes.func.isRequired,
    unselectedLabel: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { jobs: [] };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh = () => {
    const { getUserJobs, setData, shared } = this.props;
    getUserJobs('').then(jobs => {
      const selected = shared.selectedJob;
      const i = _.findIndex(jobs, { id: selected && selected.id });
      setData('selectedJob', jobs[i]);
      this.setState({ jobs });
    });
  }

  onSelect = job => {
    const { setData } = this.props;
    setData('selectedJob', job);
  };

  onFilter = (job, index, collection, searchTerm) => {
    const workplace = job.location_data;
    const business = workplace.business_data;
    return job.title.toLowerCase().indexOf(searchTerm) > -1 ||
          workplace.name.toLowerCase().indexOf(searchTerm) > -1 ||
          business.name.toLowerCase().indexOf(searchTerm) > -1;
  };

  renderItem = job => {
    const image = utils.getJobLogo(job, true);
    const jobFullName = utils.getJobFullName(job);
    const tokens = job.location_data.business_data.tokens;
    const closed = utils.getJobStatus(job, this.props.staticData.jobStatuses) === 'CLOSED';

    return (
      <JobItem
        className={closed ? styles.closed : ''}
        key={job.id}
        image={image}
        name={job.title}
        comment={`${jobFullName}  (${tokens} Credit${tokens !== 1 ? 's' : ''})`}
      />
    );
  };

  render() {
    const { shared, unselectedLabel } = this.props;
    const { jobs } = this.state;
    return (
      <div className="lg-select">
        <div className="header">
          <div className="title">Select Job</div>
          <button
            className="fa fa-refresh btn-icon"
            onClick={this.onRefresh}
          />
        </div>

        <ReactSuperSelect
          placeholder={jobs.length === 0 ? 'You have not added any jobs yet.' : unselectedLabel}
          dataSource={jobs}
          initialValue={shared.selectedJob}
          onChange={this.onSelect}
          customOptionTemplateFunction={this.renderItem}
          customFilterFunction={this.onFilter}
          searchable={jobs.length > 0}
          searchPlaceholder="Search"
          deselectOnSelectedOptionClick={false}
          noResultsString=""
        />
      </div>
    );
  }
}
