import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Avatar } from 'antd';

import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx } from 'components';
import JobDetails from '../components/JobDetails';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

class MyApplications extends React.Component {
  state = {
    filterText: '',
    selectedId: null
  };

  componentWillMount() {
    const { appId } = this.props.location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    } else {
      this.props.getApplications();
    }
  }

  onChangeFilterText = filterText => this.setState({ filterText });

  onSelectApp = selectedId => this.setState({ selectedId });

  onMessage = (appId, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${appId}/`);
  };

  filterOption = ({ job_data }) => {
    const filterText = this.state.filterText.toLowerCase();
    const subName = helper.getFullBWName(job_data);
    return (
      !filterText ||
      job_data.title.toLowerCase().indexOf(filterText) >= 0 ||
      subName.toLowerCase().indexOf(filterText) >= 0
    );
  };

  renderApp = app => {
    const job = app.job_data;
    const logo = helper.getJobLogo(job);
    const subName = helper.getFullBWName(job);
    const contract = helper.getItemByID(DATA.contracts, job.contract).short_name;
    const hours = helper.getItemByID(DATA.hours, job.hours).short_name;

    return (
      <List.Item
        key={app.id}
        actions={[<span onClick={e => this.onMessage(app.id, e)}>Message</span>]}
        onClick={() => this.onSelectApp(app.id)}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${job.title} (${subName})`}
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

  render() {
    const { jobseeker, applications, error } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" {...this.props} />;
    }

    const { selectedId } = this.state;
    const selectedApp = applications && helper.getItemByID(applications, selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>My Applications</h2>
          <SearchBox width="200px" onChange={this.onChangeFilterText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={applications}
            error={error && 'Server Error!'}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            renderItem={this.renderApp}
            emptyRender={
              <AlertMsg>
                <span>You have no applications.</span>
              </AlertMsg>
            }
          />
        </div>

        {selectedApp && (
          <JobDetails
            job={selectedApp.job_data}
            onMessage={() => this.onMessage(selectedId)}
            onClose={() => this.onSelectApp()}
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    applications: state.applications.applications,
    error: state.applications.error
  }),
  {
    getApplications
  }
)(MyApplications);
