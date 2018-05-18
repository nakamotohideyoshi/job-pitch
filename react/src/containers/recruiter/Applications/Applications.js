import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Select, Tabs } from 'antd';
import styled from 'styled-components';

import { selectBusiness } from 'redux/recruiter/businesses';
import { findJobseekers } from 'redux/recruiter/find';
import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, Logo } from 'components';
import FindTalent from './FindTalent';
import MyApplications from './MyApplications';
import MyConnections from './MyConnections';
import Wrapper from './Applications.styled';

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
  };

  jobsFilterOption = (input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;

  onSelectJob = id => this.replacePath({ id });

  onSelecteTab = tab => this.replacePath({ tab });

  onChangeSearchText = searchText => this.setState({ searchText });

  render() {
    const { jobs, job, jobseekers, myApplications, myConnections, myShortlist, match } = this.props;
    const searchText = this.state.searchText.toLowerCase();
    const activeKey = match.url.split('/')[3];
    const jobId = (job || {}).id;
    const appCount = (myApplications || []).length;
    const connCount = (myConnections || []).length;
    const shortCount = (myShortlist || []).length;

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
          <TabPane tab={`My Applications (${appCount})`} key="apps">
            <MyApplications job={job} applications={myApplications} searchText={searchText} />
          </TabPane>
          <TabPane tab={`My Connections (${connCount})`} key="conns">
            <MyConnections job={job} applications={myConnections} searchText={searchText} />
          </TabPane>
          <TabPane tab={`My Shortlist (${shortCount})`} key="shortlist">
            <MyConnections job={job} applications={myShortlist} searchText={searchText} shortlist />
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
    const myApplications = applications && applications.filter(({ status }) => status === DATA.APP.CREATED);
    const myConnections = applications && applications.filter(({ status }) => status === DATA.APP.ESTABLISHED);
    const myShortlist = myConnections && myConnections.filter(({ shortlisted }) => shortlisted);

    return {
      jobs,
      jobId,
      job,
      jobseekers: state.rc_find.jobseekers,
      myApplications,
      myConnections,
      myShortlist
    };
  },
  {
    selectBusiness,
    findJobseekers,
    getApplications
  }
)(Applications);
