import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Select } from 'antd';
import styled from 'styled-components';

import { selectBusiness } from 'redux/recruiter/businesses';
import { updateStatus } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, Logo } from 'components';

const Option = Select.Option;

const StyledMenu = styled(Menu)`
  &.ant-menu {
    line-height: 38px;
    font-size: 12px;
    font-weight: 500;
  }
`;

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

class Header extends React.Component {
  componentWillMount() {
    const { jobs, selectedJob, match, history } = this.props;
    if (!selectedJob) {
      const jobId = helper.loadData('applications/jobId');
      const job = helper.getItemByID(jobs, jobId) || jobs[0];
      if (job) {
        const arr = match.url.split('/');
        arr[4] = job.id;
        history.replace(arr.join('/'));
      }
    }
  }

  selectJob = id => {
    const { history, match, jobs, selectBusiness } = this.props;
    const jobId = id || helper.str2int(match.params.jobId) || helper.loadData('applications/jobId');
    const job = helper.getItemByID(jobs, jobId) || jobs[0];

    if (job) {
      selectBusiness({
        business: job.location_data.business_data
      });
    }

    const selectedJobId = (job || {}).id;
    this.props.updateStatus({ selectedJobId });
    helper.saveData('applications/jobId', selectedJobId);

    const arr = match.url.split('/');
    arr[4] = selectedJobId;
    history.replace(arr.join('/'));
  };

  changeSearch = searchText => this.props.updateStatus({ searchText });

  render() {
    const { jobs, selectedJob, searchText, match } = this.props;
    const selectedKey = match.url.split('/')[3];
    const selectedJobId = (selectedJob || {}).id;

    return (
      <Fragment>
        <Helmet title="Applications" />

        <PageHeader>
          <h2>Applications</h2>
        </PageHeader>

        <StyledMenu mode="horizontal" selectedKeys={[selectedKey]}>
          <Menu.Item key="find">
            <Link to={`/recruiter/applications/find/${selectedJobId || ''}`}>Find Talent</Link>
          </Menu.Item>
          <Menu.Item key="apps">
            <Link to={`/recruiter/applications/apps/${selectedJobId || ''}`}>My Applications</Link>
          </Menu.Item>
          <Menu.Item key="conns">
            <Link to={`/recruiter/applications/conns/${selectedJobId || ''}`}>My Connections</Link>
          </Menu.Item>
          <Menu.Item key="shortlist">
            <Link to={`/recruiter/applications/shortlist/${selectedJobId || ''}`}>My Shortlist</Link>
          </Menu.Item>
        </StyledMenu>

        <Filters>
          <Select
            showSearch
            value={selectedJobId}
            placeholder="Select a job"
            filterOption={(input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.selectJob}
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

          <SearchBox width="200px" defaultValue={searchText} onChange={this.changeSearch} />
        </Filters>
      </Fragment>
    );
  }
}

export default withRouter(
  connect(
    (state, { match }) => {
      const jobs = state.rc_jobs.jobs.filter(({ status }) => status === DATA.JOB.OPEN);
      const jobId = helper.str2int(match.params.jobId);
      const selectedJob = helper.getItemByID(jobs, jobId);
      return {
        jobs,
        selectedJob,
        searchText: state.applications.searchText
      };
    },
    {
      updateStatus,
      selectBusiness
    }
  )(Header)
);
