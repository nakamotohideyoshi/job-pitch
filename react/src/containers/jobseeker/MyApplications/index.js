import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Avatar } from 'antd';

import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons } from 'components';
import JobDetails from '../components/JobDetails';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

class MyApplications extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    const { getApplications, location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    } else {
      getApplications();
    }
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onSelect = selectedId => this.setState({ selectedId });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${id}/`);
  };

  filterOption = ({ job_data }) => {
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getFullBWName(job_data);
    return job_data.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderApp = app => {
    const { id, job_data } = app;
    const { title, contract, hours, description } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;

    return (
      <List.Item
        key={id}
        actions={[
          <span onClick={e => this.onMessage(app, e)}>
            <Icons.Comment />
          </span>
        ]}
        onClick={() => this.onSelect(id)}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${title} (${name})`}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {description}
            </Truncate>
          }
        />
        <div className="properties">
          <span>
            {contractName} / {hoursName}
          </span>
        </div>
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have no applications.</span>
    </AlertMsg>
  );

  render() {
    const { jobseeker, applications, error } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" />;
    }

    const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>My Applications</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={applications}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            error={error && 'Server Error!'}
            renderItem={this.renderApp}
            emptyRender={this.renderEmpty}
          />
        </div>

        {selectedApp && (
          <JobDetails
            job={selectedApp.job_data}
            onMessage={() => this.onMessage(selectedApp)}
            onClose={() => this.onSelect()}
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    applications: state.applications.applications,
    error: state.applications.error
  }),
  {
    getApplications
  }
)(MyApplications);
