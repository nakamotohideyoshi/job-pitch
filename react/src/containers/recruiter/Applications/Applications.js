
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import SelectJob from './SelectJob/SelectJob';
import FindTalent from './FindTalent/FindTalent';
import MyApplications from './MyApplications/MyApplications';
import MyConnections from './MyConnections/MyConnections';
import styles from './Applications.scss';

@connect(
  () => ({ }),
  { ...apiActions }
)
export default class Applications extends Component {
  static propTypes = {
    getUserJobsAction: PropTypes.func.isRequired,
    getApplicationsAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { };
  }

  onSelectedJob = job => {
    this.setState({ job }, () => {
      this.onRefreshApplications();
    });
  };

  onRefreshJob = () => {
    if (this.state.job) {
      this.props.getUserJobsAction(this.state.job.id + '/')
        .then(job => {
          this.setState({ job });
          // setTimeout(() => {
          //   this.setState({ job });
          //   console.log('onRefreshJob');
          // }, 1000);
        });
    }
  }

  onRefreshApplications = () => {
    this.setState({ applications: null });

    if (this.state.job) {
      this.props.getApplicationsAction(`?job=${this.state.job.id}`)
        .then(applications => {
          this.setState({ applications });
        });
      // setTimeout(() => {
      //   this.setState({ applications: utils.getTempApplications() });
      //   console.log('onRefreshApplications');
      // }, 2000);
    }
  }

  onRefreshAll = () => {
    this.onRefreshJob();
    this.onRefreshApplications();
  }

  onUpdatedApplications = () => this.setState({
    applications: this.state.applications.slice(0)
  })

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
        className={[styles.job, 'shadow-board'].join(' ')}
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

                <div className={[styles.applications, 'shadow-board'].join(' ')}>
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
