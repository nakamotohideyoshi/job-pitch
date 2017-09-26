import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import * as apiActions from 'redux/modules/api';
import BusinessList from './BusinessList/BusinessList';
import WorkplaceList from './WorkplaceList/WorkplaceList';
import JobList from './JobList/JobList';
import styles from './Jobs.scss';

@connect(
  () => ({
  }),
  { ...apiActions }
)
export default class Jobs extends Component {
  static propTypes = {
  }

  constructor(props) {
    super(props);
    this.state = {
      tabKey: 1,
    };
  }

  onSelectedBusiness = businessId => {
    this.setState({ businessId });
    if (businessId) {
      this.onSelectTab(2);
    }
    this.onSelectedWorkplace();
  }

  onSelectedWorkplace = workplaceId => {
    this.setState({ workplaceId });
    if (workplaceId) {
      this.onSelectTab(3);
    }
  }

  onSelectTab = tabKey => {
    this.setState({ tabKey });
  }

  render() {
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
              />
            </Tab>
          </Tabs>

        </div>

      </div>
    );
  }
}
