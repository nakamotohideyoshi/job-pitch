import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Select, Tabs } from 'antd';

import { getApplications, getJobs } from 'redux/selectors';
import { findJobseekers } from 'redux/recruiter/find';
import { selectBusiness } from 'redux/recruiter/businesses';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, SearchBox, Logo } from 'components';
import FindTalent from './FindTalent';
import NewApplications from './NewApplications';
import MyConnections from './MyConnections';
import Interviews from './Interviews';
import Wrapper from './Applications.styled';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

class Applications extends React.Component {
  state = {
    searchText: ''
  };

  componentWillMount() {
    const { jobId, job, location } = this.props;
    const { id } = job || {};
    const { tab } = location.state || {};

    if (jobId !== id) {
      this.replacePath({ id });
    } else if (job) {
      !tab && this.findJobseekers(this.props);

      this.props.selectBusiness(job.location_data.business_data.id);
      helper.saveData('applications/jobId', id);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.findJobseekers(nextProps);

    const { jobId, job } = nextProps;
    if (jobId !== this.props.jobId && job) {
      this.props.selectBusiness(job.location_data.business_data.id);
      helper.saveData('applications/jobId', jobId);
    }
  }

  replacePath = ({ tab, id }) => {
    const { location, history } = this.props;
    const arr = location.pathname.split('/');
    if (tab) arr[3] = tab;
    if (id) arr[4] = id;
    history.replace(arr.join('/'));
  };

  findJobseekers = ({ jobId, location }) => {
    const arr = location.pathname.split('/');
    if (arr[3] === 'find' && this.filerJobId !== jobId) {
      this.filerJobId = jobId;
      this.props.findJobseekers({
        params: {
          job: jobId
        }
      });
    }
  };

  jobsFilterOption = (input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;

  onSelectJob = id => this.replacePath({ id });

  onSelecteTab = tab => this.replacePath({ tab });

  onChangeSearchText = searchText => this.setState({ searchText });

  render() {
    const { jobs, job, jobseekers, newApplications, myConnections, myShortlist, location, interviews } = this.props;
    const searchText = this.state.searchText.toLowerCase();
    const activeKey = location.pathname.split('/')[3];
    const jobId = (job || {}).id;
    const appCount = (newApplications || []).length;
    const connCount = (myConnections || []).length;
    const shortCount = (myShortlist || []).length;
    const interviewCount = (interviews || []).length;

    return (
      <Wrapper className="container">
        <Helmet title="Applications" />

        <PageHeader>
          <h2>Applications</h2>
        </PageHeader>

        <PageSubHeader>
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
                    {job.location_data.name}, {job.location_data.business_data.name}
                  </span>
                </Option>
              );
            })}
          </Select>

          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageSubHeader>

        <Tabs activeKey={activeKey} animated={false} onChange={this.onSelecteTab}>
          <TabPane tab="Find Talent" key="find">
            <FindTalent job={job} jobseekers={jobseekers} searchText={searchText} />
          </TabPane>
          <TabPane tab={`New Applications (${appCount})`} key="apps">
            <NewApplications job={job} applications={newApplications} searchText={searchText} />
          </TabPane>
          <TabPane tab={`My Connections (${connCount})`} key="conns">
            <MyConnections job={job} applications={myConnections} searchText={searchText} />
          </TabPane>
          <TabPane tab={`My Shortlist (${shortCount})`} key="shortlist">
            <MyConnections job={job} applications={myShortlist} searchText={searchText} shortlist />
          </TabPane>
          <TabPane tab={`Interviews (${interviewCount})`} key="interviews">
            <Interviews job={job} applications={interviews} searchText={searchText} />
          </TabPane>
        </Tabs>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobs = getJobs(state).filter(({ status }) => status === DATA.JOB.OPEN);
    const jobId = helper.str2int(match.params.jobId);
    const jobId1 = jobId || helper.loadData('applications/jobId');
    const job = helper.getItemByID(jobs, jobId1) || jobs[0];
    const id = (job || {}).id;
    const applications = getApplications(state);
    const filteredApplications = applications && applications.filter(({ job_data }) => job_data.id === id);
    const newApplications =
      filteredApplications && filteredApplications.filter(({ status }) => status === DATA.APP.CREATED);
    const myConnections =
      filteredApplications && filteredApplications.filter(({ status }) => status === DATA.APP.ESTABLISHED);
    const myShortlist = myConnections && myConnections.filter(({ shortlisted }) => shortlisted);
    const interviews = myConnections && myConnections.filter(({ interview }) => interview);
    interviews.sort((a, b) => (a.interview.at < b.interview.at ? 1 : -1));

    return {
      jobs,
      jobId,
      job,
      jobseekers: state.rc_find.jobseekers,
      newApplications,
      myConnections,
      myShortlist,
      interviews
    };
  },
  {
    findJobseekers,
    selectBusiness
  }
)(Applications);
