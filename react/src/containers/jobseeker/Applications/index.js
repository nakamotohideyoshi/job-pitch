import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';

import { Loading, PageHeader, SearchBox, AlertMsg } from 'components';
import Container from './Wrapper';
import NoPitch from '../NoPitch';

import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { updateStatus, getApplications } from 'redux/jobseeker/myapps';

class JSApplications extends React.Component {
  componentWillMount() {
    if (this.props.requestRefresh) {
      this.props.getApplications();
    }
  }

  selectApp = appId => this.props.history.push(`/jobseeker/applications/${appId}/`);

  onMessage = (e, appId) => {
    e.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${appId}/`);
  };

  filterApp = searchText => this.props.updateStatus({ searchText });

  renderApp = app => {
    const job = app.job_data;
    const logo = helper.getJobLogo(job);
    const businessName = helper.getFullBWName(job);
    const contract = helper.getItemByID(DATA.contracts, job.contract).short_name;
    const hours = helper.getItemByID(DATA.hours, job.hours).short_name;

    return (
      <List.Item
        key={app.id}
        actions={[<span onClick={e => this.onMessage(e, app.id)}>Message</span>]}
        onClick={() => this.selectApp(app.id)}
      >
        <List.Item.Meta
          avatar={<img src={logo} alt="" width="100" />}
          title={`${job.title} (${businessName})`}
          description={
            <div>
              <div>
                {contract} / {hours}
              </div>
              <div>{job.description}</div>
            </div>
          }
        />
      </List.Item>
    );
  };

  renderApps = () => {
    const { applications, searchText, currentPage, updateStatus, loading } = this.props;

    if (applications.length === 0) {
      if (loading) {
        return <Loading size="large" />;
      }

      return (
        <AlertMsg>
          <span>You have no applications.</span>
        </AlertMsg>
      );
    }

    const filteredApps = applications.filter(
      ({ job_data: { title, location_data } }) =>
        !searchText ||
        title.toLowerCase().indexOf(searchText) !== -1 ||
        location_data.name.toLowerCase().indexOf(searchText) !== -1 ||
        location_data.business_data.name.toLowerCase().indexOf(searchText) !== -1
    );

    if (filteredApps.length === 0) {
      return (
        <AlertMsg>
          <span>
            <FontAwesomeIcon icon={faSearch} />No search results
          </span>
        </AlertMsg>
      );
    }

    const pageSize = 10;
    const index = (currentPage - 1) * pageSize;
    const pageApps = filteredApps.slice(index, index + pageSize);
    const pagination = {
      pageSize,
      current: currentPage,
      total: filteredApps.length,
      onChange: currentPage => updateStatus({ currentPage })
    };

    return (
      <List
        itemLayout="horizontal"
        pagination={pagination}
        dataSource={pageApps}
        loading={loading}
        renderItem={this.renderApp}
      />
    );
  };

  render() {
    const { error, searchText, jobseeker } = this.props;
    console.log(this.props);
    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" {...this.props} />;
    }

    return (
      <Container>
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>My Applications</h2>
          <SearchBox width="200px" defaultValue={searchText} onChange={this.filterApp} />
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          this.renderApps()
        )}
      </Container>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    applications: state.js_myapps.applications,
    error: state.js_myapps.error,
    currentPage: state.js_myapps.currentPage,
    searchText: state.js_myapps.searchText,
    loading: state.js_myapps.loading,
    requestRefresh: state.js_myapps.requestRefresh
  }),
  {
    updateStatus,
    getApplications
  }
)(JSApplications);
