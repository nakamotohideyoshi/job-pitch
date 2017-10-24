import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link, browserHistory } from 'react-router';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import { Loading, LogoImage } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import FindTalent from './FindTalent/FindTalent';
import MyApplications from './MyApplications/MyApplications';
import MyConnections from './MyConnections/MyConnections';
import styles from './Applications.scss';

export default class Applications extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      tabKey: parseInt(utils.getShared('applications_selected_tab'), 10) || 1
    };
    this.api = ApiClient.shared();
    this.jobid = this.props.params.jobid;
  }

  componentDidMount() {
    this.api.getUserJobs(this.jobid + '/').then(
      job => {
        this.setState({ job }, () => {
          this.onRefreshApplications();
        });
      },
      () => browserHistory.push('/recruiter/applications')
    );
  }

  onRefreshJob = () => {
    if (this.state.job) {
      this.api.getUserJobs(this.state.job.id + '/').then(
        job => this.setState({ job })
      );
    }
  }

  onRefreshApplications = () => {
    this.setState({ applications: null });
    if (this.state.job) {
      this.api.getApplications(`?job=${this.state.job.id}`).then(
        applications => {
          applications.sort((a, b) => !a.shortlisted && b.shortlisted);
          this.setState({ applications });
        }
      );
    }
  }

  onRefreshAll = () => {
    this.onRefreshJob();
    this.onRefreshApplications();
  }

  onUpdatedApplications = () => {
    const applications = this.state.applications.slice(0);
    applications.sort((a, b) => !a.shortlisted && b.shortlisted);
    this.setState({ applications });
  }

  onClickJob = () => {
    utils.setShared('jobs_selected_job', this.state.job.id);
    browserHistory.push('/recruiter/jobs');
  }

  onSelectTab = tabKey => {
    this.setState({ tabKey });
    utils.setShared('applications_selected_tab', tabKey);
  }

  renderJob = () => {
    const { job } = this.state;
    const image = utils.getJobLogo(job);
    const jobFullName = utils.getJobFullName(job);
    const tokens = job.location_data.business_data.tokens;
    const strTokens = `${tokens} Credit${tokens !== 1 ? 's' : ''}`;

    return (
      <Link
        className={[styles.job, 'list-item board shadow'].join(' ')}
        onClick={() => this.onClickJob(job)}
      >
        <LogoImage image={image} size={50} />
        <div className="content">
          <h5>{job.title}</h5>
          <div>
            <span className={styles.fullName}>{jobFullName}</span>
            <span className={styles.tokens}>{strTokens}</span>
          </div>
        </div>
      </Link>
    );
  }

  render() {
    const { job, applications } = this.state;

    if (!job) {
      return <Loading />;
    }

    return (
      <div className={styles.root}>
        <Helmet title="Applications" />

        <div className="container">
          <div className="pageHeader">
            <h3>{job ? 'Applications' : 'Select Job'}</h3>
            <Link className="link" to="/recruiter/applications">{'<< Job List'}</Link>
          </div>

          <div>
            { this.renderJob() }

            <div className={[styles.applications, 'board shadow'].join(' ')}>
              <Tabs
                id="application-mode"
                activeKey={this.state.tabKey}
                onSelect={this.onSelectTab}
              >
                <Tab eventKey={1} title="Find Talent">
                  <FindTalent
                    parent={this}
                    job={job}
                  />
                </Tab>
                <Tab eventKey={2} title="My Applications">
                  <MyApplications
                    parent={this}
                    applications={applications}
                    job={job}
                  />
                </Tab>
                <Tab eventKey={3} title="My Connections">
                  <MyConnections
                    parent={this}
                    applications={applications}
                  />
                </Tab>
                <Tab eventKey={4} title="My Shortlist">
                  <MyConnections
                    parent={this}
                    applications={applications}
                    shortlisted
                  />
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
