import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import { Loading, FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import _ from 'lodash';
import BusinessList from './BusinessList/BusinessList';
import WorkplaceList from './WorkplaceList/WorkplaceList';
import JobList from './JobList/JobList';
import styles from './Jobs.scss';

@connect(
  () => ({ }),
  { ...commonActions }
)
export default class Jobs extends Component {

  static propTypes = {
    alertShow: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      tabKey: 1,
      jobid: parseInt(utils.getShared('jobs_selected_job'), 10)
    };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    if (!this.state.jobid) {
      this.loadBusinesses();
      return;
    }

    utils.setShared('jobs_selected_job');

    this.api.getUserJobs(this.state.jobid + '/').then(
      job => {
        this.setState({
          jobid: null,
          businessId: job.location_data.business_data.id,
          workplaceId: job.location_data.id,
        });
        this.selectJob(job);
      },
      () => {
        this.setState({ jobid: null });
        this.loadBusinesses();
      }
    );
  }

  getBusinessId = () => this.state.businessId;
  getWorkplaceId = () => this.state.workplaceId;

  /* business progress */

  loadBusinesses = () => {
    this.setState({ businesses: null });

    return this.api.getUserBusinesses('').then(
      businesses => this.setState({ businesses })
    );
  }

  deleteBusiness = business => {
    business.deleting = true;
    this.updatedBusinesses();

    return this.api.deleteUserBusiness(business.id).then(
      () => {
        _.remove(this.state.businesses, item => item.id === business.id);
        this.updatedBusinesses();
        utils.successNotif('Deleted!');

        if (this.state.businessId === business.id) {
          this.setState({ businessId: null, workplaceId: null });
        }
      },
      () => {
        business.deleting = false;
        this.updatedBusinesses();
      }
    );
  }

  selectBusiness = businessId => this.setState(
    { tabKey: 2, businessId, workplaceId: null },
    this.loadWorkplaces
  );

  updatedBusinesses = () => this.setState({
    businesses: this.state.businesses.slice(0)
  });

  /* workplace progress */

  loadWorkplaces = () => {
    const { businessId } = this.state;

    if (businessId === null) {
      return Promise.reject();
    }

    this.setState({ workplaces: null });

    return this.api.getUserWorkplaces(`?business=${businessId}`).then(
      workplaces => this.setState({ workplaces })
    );
  }

  deleteWorkplace = workplace => {
    workplace.deleting = true;
    this.updatedWorkplaces();

    return this.api.deleteUserWorkplace(workplace.id).then(
      () => {
        _.remove(this.state.workplaces, item => item.id === workplace.id);
        this.updatedWorkplaces();
        utils.successNotif('Deleted!');

        if (this.state.workplaceId === workplace.id) {
          this.setState({ workplaceId: null });
        }
      },
      () => {
        workplace.deleting = false;
        this.updatedWorkplaces();
      }
    );
  }

  selectWorkplace = workplaceId => this.setState(
    { tabKey: 3, workplaceId },
    this.loadJobs
  );

  updatedWorkplaces = () => this.setState({
    workplaces: this.state.workplaces.slice(0)
  });

  /* job progress */

  loadJobs = () => {
    const { workplaceId } = this.state;

    if (workplaceId === null) {
      return Promise.reject();
    }

    this.setState({ jobs: null });

    return this.api.getUserJobs(`?location=${workplaceId}`).then(
      jobs => this.setState({ jobs })
    );
  }

  deleteJob = job => {
    job.deleting = true;
    this.updatedjobs();

    return this.api.deleteUserJob(job.id).then(
      () => {
        _.remove(this.state.jobs, item => item.id === job.id);
        this.updatedjobs();
        utils.successNotif('Deleted!');

        if ((this.state.job || {}).id === job.id) {
          this.setState({ job: null });
        }
      },
      () => {
        job.deleting = false;
        this.updatedjobs();
      }
    );
  }

  updateJobStatus = (job, status) => {
    job.updating = true;
    this.updatedjobs();

    const data = Object.assign({}, job);
    data.status = utils.getJobStatusByName(status).id;
    return this.api.saveUserJob(data).then(
      () => {
        job.status = data.status;
        job.updating = false;
        this.updatedjobs();
        utils.successNotif('Updated!');
      },
      () => {
        job.updating = false;
        this.updatedjobs();
      }
    );
  }

  selectJob = job => this.setState(
    { tabKey: 3, job },
  );

  updatedjobs = () => this.setState({
    jobs: this.state.jobs.slice(0)
  });

  /* select tab */

  selectedTab = tabKey => {
    Promise.all([
      this.closeEdit(this.businessList),
      this.closeEdit(this.workplaceList),
      this.closeEdit(this.jobList),
    ]).then(
      () => {
        if (tabKey === 1) {
          this.loadBusinesses();
        } else if (tabKey === 2) {
          this.loadWorkplaces();
        } else if (tabKey === 3) {
          this.loadJobs();
        }
        this.setState({ tabKey, job: null });
      }
    );
  }

  closeEdit = page => new Promise(resolve => {
    if (!page.state.editingData || !FormComponent.needToSave) {
      page.onEdit();
      resolve();
      return;
    }

    this.props.alertShow(
      'Confirm',
      'Are you sure you want to discard your changes?',
      [
        { label: 'No' },
        {
          label: 'Yes',
          style: 'success',
          callback: () => {
            FormComponent.needToSave = false;
            page.onEdit();
            resolve();
          }
        },
      ]
    );
  });

  render() {
    const { jobid, tabKey, businesses, businessId, workplaces, workplaceId, jobs, job } = this.state;

    if (jobid) {
      return <Loading />;
    }

    return (
      <div className={styles.root}>
        <Helmet title="My Workplace & Jobs" />

        <div className="container">
          <div className="pageHeader">
            <h3>My Workplace & Jobs</h3>
          </div>

          <Tabs
            id="jobpost-tab"
            className={styles.jobPostTabs}
            activeKey={tabKey}
            onSelect={this.selectedTab}
          >
            <Tab eventKey={1} title="Business">
              <BusinessList
                parent={this}
                businesses={businesses}
                selectedId={businessId}
              />
            </Tab>
            <Tab eventKey={2} title="Workplace" disabled={!businessId}>
              <WorkplaceList
                parent={this}
                workplaces={workplaces}
                selectedId={workplaceId}
              />
            </Tab>
            <Tab eventKey={3} title="Job" disabled={!workplaceId}>
              <JobList
                parent={this}
                jobs={jobs}
                selectedJob={job}
              />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}
