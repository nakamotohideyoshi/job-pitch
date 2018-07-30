import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Select, Tabs } from 'antd';
import styled from 'styled-components';

import { selectBusiness } from 'redux/recruiter/businesses';
import { findJobseekers } from 'redux/recruiter/find';
import { getApplications } from 'redux/applications';
import { getInterviews } from 'redux/interviews';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, Logo } from 'components';
import FindTalent from './FindTalent';
import MyApplications from './MyApplications';
import MyConnections from './MyConnections';
import Interviews from './Interviews';
import Wrapper from './Applications.styled';

import * as _ from 'lodash';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

const Filters = styled.div`
  display: flex;
  margin: 20px 0;

  .ant-select {
    flex: 1;
    margin-right: 20px;

    .ant-select-selection-selected-value .logo {
      float: left;
      margin: 4px 8px 0 0 !important;
    }
  }
`;

class Applications extends React.Component {
  state = {
    searchText: ''
  };

  componentWillMount() {
    const { jobId, job, location } = this.props;
    const { id } = job || {};
    if (jobId !== id) {
      this.replacePath({ id });
    } else if (job) {
      const { tab } = location.state || {};
      if (!tab) {
        this.getData(job);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { jobId, job } = nextProps;

    if (jobId !== this.props.jobId && job) {
      this.getData(job);
    }
  }

  replacePath = ({ tab, id }) => {
    const { match, history } = this.props;
    const arr = match.url.split('/');
    if (tab) arr[3] = tab;
    if (id) arr[4] = id;
    history.replace(arr.join('/'));
  };

  getData = job => {
    const { id, location_data } = job;

    this.props.selectBusiness(location_data.business_data.id);
    helper.saveData('applications/jobId', id);

    this.props.findJobseekers({
      params: {
        job: id
      }
    });
    this.props.getApplications({
      params: {
        job: id
      }
    });
    this.props.getInterviews();
  };

  jobsFilterOption = (input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;

  onSelectJob = id => this.replacePath({ id });

  onSelecteTab = tab => this.replacePath({ tab });

  onChangeSearchText = searchText => this.setState({ searchText });

  render() {
    const {
      jobs,
      job,
      jobseekers,
      myApplications,
      myConnections,
      myShortlist,
      match,
      myInterviews,
      applications,
      interviews
    } = this.props;
    const location = job.location_data;
    const business = location.business_data;
    const searchText = this.state.searchText.toLowerCase();
    const activeKey = match.url.split('/')[3];
    const jobId = (job || {}).id;
    const appCount = (myApplications || []).length;
    const connCount = (myConnections || []).length;
    const shortCount = (myShortlist || []).length;
    const interviewCount = (myInterviews || []).length;

    return (
      <Wrapper className="container">
        <Helmet title="Applications" />

        <PageHeader>
          <h2>Applications</h2>
        </PageHeader>

        <Filters>
          <Select
            showSearch
            value={jobId}
            placeholder="Select a job"
            filterOption={this.jobsFilterOption}
            onChange={this.onSelectJob}
          >
            {jobs.map(job => {
              const logo = helper.getJobLogo(job);
              return (
                <Option key={job.id} value={job.id}>
                  <Logo src={logo} className="logo" size="22px" />
                  {job.title}
                  <span className="right-menu-item">
                    {location.name}, {business.name}
                  </span>
                </Option>
              );
            })}
          </Select>

          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </Filters>

        <Tabs activeKey={activeKey} animated={false} onChange={this.onSelecteTab}>
          <TabPane tab="Find Talent" key="find">
            <FindTalent job={job} jobseekers={jobseekers} searchText={searchText} />
          </TabPane>
          <TabPane tab={`New Applications (${appCount})`} key="apps">
            <MyApplications job={job} applications={myApplications} searchText={searchText} />
          </TabPane>
          <TabPane tab={`My Connections (${connCount})`} key="conns">
            <MyConnections job={job} applications={myConnections} searchText={searchText} />
          </TabPane>
          <TabPane tab={`My Shortlist (${shortCount})`} key="shortlist">
            <MyConnections job={job} applications={myShortlist} searchText={searchText} shortlist />
          </TabPane>
          <TabPane tab={`Interviews (${interviewCount})`} key="interviews">
            <Interviews
              job={job}
              applications={myInterviews}
              loading={applications === null || interviews === null}
              searchText={searchText}
            />
          </TabPane>
        </Tabs>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobs = state.rc_jobs.jobs.filter(({ status }) => status === DATA.JOB.OPEN);
    const jobId = helper.str2int(match.params.jobId);
    const id = jobId || helper.loadData('applications/jobId');
    const job = helper.getItemByID(jobs, id) || jobs[0];

    const { applications } = state.applications;
    const { interviews } = state.interviews;
    const myApplications = applications && applications.filter(({ status }) => status === DATA.APP.CREATED);
    const myConnections = applications && applications.filter(({ status }) => status === DATA.APP.ESTABLISHED);
    const myShortlist = myConnections && myConnections.filter(({ shortlisted }) => shortlisted);

    let myInterviews = [];

    _.forEach(interviews, interview => {
      _.forEach(applications, application => {
        if (interview.application === application.id) {
          let applicationWithInterview = Object.assign({}, application);
          if (interview.cancelled == null) {
            applicationWithInterview.interview = interview;
            myInterviews.push(applicationWithInterview);
          }
        }
      });
    });

    return {
      jobs,
      jobId,
      job,
      jobseekers: state.rc_find.jobseekers,
      myApplications,
      myConnections,
      myShortlist,
      myInterviews,
      applications,
      interviews
    };
  },
  {
    selectBusiness,
    findJobseekers,
    getApplications,
    getInterviews
  }
)(Applications);
