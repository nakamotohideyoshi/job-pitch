import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Avatar, Tooltip, Button } from 'antd';

import { getApplications } from 'redux/applications';
import { getInterviews } from 'redux/interviews';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, LargeModal } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

import * as _ from 'lodash';

class JSInterviews extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    const { getApplications, getInterviews, location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    } else {
      getApplications();
      getInterviews();
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
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.onMessage(app, e)}>
              <Icons.CommentAlt />
            </span>
          </Tooltip>
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
    const { jobseeker, applications, interviews, error } = this.props;

    let myInterviews = [];

    _.forEach(interviews, interview => {
      _.forEach(applications, application => {
        if (interview.application === application.id) {
          let applicationWithInterview = Object.assign({}, application);
          applicationWithInterview.interview = interview;
          myInterviews.push(applicationWithInterview);
        }
      });
    });

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" />;
    }

    const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>Interviews</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={myInterviews}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            error={error && 'Server Error!'}
            renderItem={this.renderApp}
            emptyRender={this.renderEmpty}
          />
        </div>

        {selectedApp && (
          <LargeModal visible title="Job Details" onCancel={() => this.onSelect()}>
            <JobDetails
              job={selectedApp.job_data}
              actions={
                <Button type="primary" onClick={() => this.onMessage(selectedApp)}>
                  Message
                </Button>
              }
            />
          </LargeModal>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    applications: state.applications.applications,
    interviews: state.interviews.interviews,
    error: state.applications.error
  }),
  {
    getApplications,
    getInterviews
  }
)(JSInterviews);