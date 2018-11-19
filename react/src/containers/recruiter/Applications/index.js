import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Select, Tabs } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getApplicationsSelector, getJobsSelector } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { findJobseekersAction } from 'redux/recruiter/find';
import { PageHeader, PageSubHeader, SearchBox, Logo, LinkButton } from 'components';
import FindTalent from './FindTalent';
import Applications from './Applications';
import Wrapper from './styled';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

/* eslint-disable react/prop-types */
class ApplicationsTab extends React.Component {
  state = {
    searchText: ''
  };

  componentWillMount() {
    const { jobId, job, location, history } = this.props;
    const { id } = job || {};
    const { tab } = location.state || {};

    if (jobId !== id) {
      const paths = location.pathname.split('/');
      paths[4] = id;
      history.replace(paths.join('/'));
    } else if (job) {
      !tab && this.findJobseekers(this.props);

      this.props.selectBusinessAction(job.location_data.business_data.id);
      helper.saveData('apps_jobId', jobId);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.findJobseekers(nextProps);

    const { jobId, job } = nextProps;
    if (jobId !== this.props.jobId && job) {
      this.props.selectBusinessAction(job.location_data.business_data.id);
      helper.saveData('apps_jobId', jobId);
    }
  }

  findJobseekers = ({ jobId, location }) => {
    const paths = location.pathname.split('/');
    if (paths[3] === 'find' && this.filerJobId !== jobId) {
      this.filerJobId = jobId;
      this.props.findJobseekersAction({
        params: {
          job: jobId
        }
      });
    }
  };

  selectJob = id => {
    const paths = this.props.location.pathname.split('/');
    paths[4] = id;
    this.props.history.push(paths.join('/'));
  };

  selecteTab = tab => {
    const paths = this.props.location.pathname.split('/');
    paths[3] = tab;
    this.props.history.push(paths.join('/'));
  };

  addApplication = () => {
    this.props.history.push({ pathname: `/recruiter/applications/add`, state: { jobId: this.props.jobId } });
  };

  changeSearchText = searchText => {
    this.setState({ searchText });
  };

  jobsFilterOption = (input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;

  render() {
    const {
      jobId,
      jobs,
      job,
      jobseekers,
      newApplications,
      myConnections,
      myShortlist,
      location,
      interviews,
      offeredApps,
      hiredApps
    } = this.props;
    const searchText = this.state.searchText.toLowerCase();
    const activeKey = location.pathname.split('/')[3];
    const appCount = newApplications.length;
    const connCount = myConnections.length;
    const shortCount = myShortlist.length;
    const interviewCount = interviews.length;
    const offeredCount = offeredApps.length;
    const hiredCount = hiredApps.length;

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
            onChange={this.selectJob}
          >
            {jobs.map(item => {
              const logo = helper.getJobLogo(item);
              return (
                <Option key={item.id} value={item.id}>
                  <Logo src={logo} className="logo" size="22px" />
                  {item.title}
                  <span className="right-menu-item">
                    {item.location_data.name}, {item.location_data.business_data.name}
                  </span>
                </Option>
              );
            })}
          </Select>

          <SearchBox width="200px" onChange={this.changeSearchText} />
        </PageSubHeader>

        <PageSubHeader>
          <div />
          <LinkButton onClick={this.addApplication}>Add application</LinkButton>
        </PageSubHeader>

        <Tabs activeKey={activeKey} animated={false} onChange={this.selecteTab}>
          <TabPane tab="Find Talent" key="find">
            <FindTalent job={job} jobseekers={jobseekers} searchText={searchText} />
          </TabPane>

          <TabPane tab={`New Applications (${appCount})`} key="apps">
            <Applications job={job} applications={newApplications} searchText={searchText} />
          </TabPane>

          <TabPane tab={`My Connections (${connCount})`} key="conns">
            <Applications job={job} applications={myConnections} searchText={searchText} />
          </TabPane>

          <TabPane tab={`My Shortlist (${shortCount})`} key="shortlist">
            <Applications job={job} applications={myShortlist} searchText={searchText} shortlist />
          </TabPane>

          <TabPane tab={`Interviews (${interviewCount})`} key="interviews">
            <Applications job={job} applications={interviews} searchText={searchText} />
          </TabPane>

          <TabPane tab={`Offered (${offeredCount})`} key="offered">
            <Applications job={job} applications={offeredApps} searchText={searchText} />
          </TabPane>

          <TabPane tab={`Hired (${hiredCount})`} key="hired">
            <Applications job={job} applications={hiredApps} searchText={searchText} />
          </TabPane>
        </Tabs>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobs = getJobsSelector(state).filter(({ status }) => status === DATA.JOB.OPEN);
    const jobId = helper.str2int(match.params.jobId);
    const jobId1 = jobId || helper.loadData('apps_jobId');
    const job = helper.getItemById(jobs, jobId1) || jobs[0];
    const id = (job || {}).id;
    const applications = getApplicationsSelector(state);
    const filteredApplications = applications.filter(({ job_data }) => job_data.id === id);
    const newApplications = filteredApplications.filter(({ status }) => status === DATA.APP.CREATED);
    const myConnections = filteredApplications.filter(({ status }) => status === DATA.APP.ESTABLISHED);
    const myShortlist = myConnections.filter(({ shortlisted }) => shortlisted);
    const interviews = myConnections.filter(({ interview, interviews }) => interview || interviews.length);
    const offeredApps = filteredApplications.filter(
      ({ status }) => status === DATA.APP.OFFERED || status === DATA.APP.DECLINED
    );
    const hiredApps = filteredApplications.filter(({ status }) => status === DATA.APP.ACCEPTED);
    interviews.sort((a, b) => {
      let interview1 = a.interview || a.interviews.slice(-1)[0];
      let interview2 = b.interview || b.interviews.slice(-1)[0];
      return interview1.at < interview2.at ? 1 : -1;
    });

    return {
      jobs,
      jobId,
      job,
      jobseekers: state.rc_find.jobseekers,
      newApplications,
      myConnections,
      myShortlist,
      interviews,
      offeredApps,
      hiredApps
    };
  },
  {
    selectBusinessAction,
    findJobseekersAction
  }
)(ApplicationsTab);
