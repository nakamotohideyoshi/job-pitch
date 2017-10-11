import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import { FormComponent, Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import BusinessList from './BusinessList/BusinessList';
import WorkplaceList from './WorkplaceList/WorkplaceList';
import JobList from './JobList/JobList';
import styles from './Jobs.scss';

@connect(
  () => ({
  }),
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
    if (this.state.jobid) {
      utils.setShared('jobs_selected_job');

      this.api.getUserJobs(this.state.jobid + '/').then(
        job => {
          this.setState({
            jobid: null,
            businessId: job.location_data.business_data.id,
            workplaceId: job.location_data.id,
            tabKey: 3
          });
          this.jobList.onInterface(job);
        },
        () => this.setState({
          jobid: null
        })
      );
    }
  }

  onSelectedBusiness = businessId => this.setState({
    tabKey: 2,
    businessId,
    workplaceId: null
  });

  onSelectedWorkplace = workplaceId => this.setState({
    tabKey: 3,
    workplaceId
  });

  onSelectTab = tabKey => {
    if (FormComponent.needToSave) {
      this.props.alertShow(
        'Confirm',
        'You did not save your changes.',
        [
          {
            label: 'Ok',
            style: 'success',
            callback: () => {
              FormComponent.needToSave = false;
              this.businessList.onEdit();
              this.workplaceList.onEdit();
              this.jobList.onEdit();
              this.setState({ tabKey });
            }
          },
          { label: 'Cancel' },
        ]
      );
    } else {
      this.businessList.onEdit();
      this.workplaceList.onEdit();
      this.jobList.onEdit();
      this.setState({ tabKey });
    }
  }

  render() {
    if (this.state.jobid) {
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
            activeKey={this.state.tabKey}
            onSelect={this.onSelectTab}
          >
            <Tab eventKey={1} title="Business">
              <BusinessList
                selectedId={this.state.businessId}
                parent={this}
              />
            </Tab>
            <Tab eventKey={2} title="Workplace" disabled={!this.state.businessId}>
              <WorkplaceList
                businessId={this.state.businessId}
                selectedId={this.state.workplaceId}
                parent={this}
              />
            </Tab>
            <Tab eventKey={3} title="Job" disabled={!this.state.workplaceId}>
              <JobList
                workplaceId={this.state.workplaceId}
                parent={this}
              />
            </Tab>
          </Tabs>

        </div>

      </div>
    );
  }
}
