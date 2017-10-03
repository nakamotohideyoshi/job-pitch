
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import SelectJob from './SelectJob/SelectJob';
import FindTalent from './FindTalent/FindTalent';
import MyApplications from './MyApplications/MyApplications';
import MyConnections from './MyConnections/MyConnections';
import styles from './Applications.scss';

export default class Applications extends Component {

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  onSelectedJob = job => {
    this.setState({ job }, () => {
      this.onRefreshApplications();
    });
  };

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

  }

  renderJob = () => {
    const { job } = this.state;
    const image = utils.getJobLogo(job, true);
    const jobFullName = utils.getJobFullName(job);
    const tokens = job.location_data.business_data.tokens;
    const strTokens = `${tokens} Credit${tokens !== 1 ? 's' : ''}`;

    return (
      <Link
        className={[styles.job, 'board-shadow'].join(' ')}
        onClick={() => this.onClickJob(job)}>
        <div>
          <img src={image} alt="" />
          <div className={styles.content} >
            <div className={styles.title}>{job.title}</div>
            <div className={styles.info}>
              <div>{jobFullName}</div>
              <span>{strTokens}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  render() {
    const { job, applications } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="Applications" />

        <div className="container">
          <div className="pageHeader">
            <h3>{job ? 'Applications' : 'Select Job'}</h3>
            {
              job &&
              <Link className="link"
                onClick={() => this.onSelectedJob()}
              >{'<< Select Job'}</Link>
            }
          </div>
          {
            !job ?
              <SelectJob parent={this} /> :
              <div>
                { this.renderJob() }

                <div className={[styles.applications, 'board-shadow'].join(' ')}>
                  <Tabs defaultActiveKey={1} id="application-mode">
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
          }
        </div>

      </div>
    );
  }
}
