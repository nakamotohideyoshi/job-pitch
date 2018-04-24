import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Select } from 'antd';
import styled from 'styled-components';

import { selectBusiness } from 'redux/recruiter/businesses';
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
    const { selectedJob, jobId } = this.props;
    const { id } = selectedJob || {};
    if (id !== jobId) {
      const { match, history } = this.props;
      const arr = match.url.split('/');
      arr[4] = id;
      history.replace(arr.join('/'));
      return;
    }
    if (selectedJob) {
      this.props.selectBusiness(selectedJob.location_data.business_data.id);
      helper.saveData('applications/jobId', id);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedJob, jobId } = nextProps;
    const { id } = selectedJob || {};
    if (id !== jobId) {
      const { match, history } = this.props;
      const arr = match.url.split('/');
      arr[4] = id;
      history.replace(arr.join('/'));
    } else {
      if (selectedJob && (selectedJob !== this.props.selectedJob || jobId !== this.props.jobId)) {
        this.props.selectBusiness(selectedJob.location_data.business_data.id);
        helper.saveData('applications/jobId', id);
      }
    }
  }

  onChangeSearch = searchText => {
    this.props.updateStatus({ searchText });
  };

  onSelectJob = id => {
    const { match, history } = this.props;
    const arr = match.url.split('/');
    arr[4] = id;
    history.replace(arr.join('/'));
  };

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

          <SearchBox width="200px" defaultValue={searchText} onChange={this.onChangeSearch} />
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
      const id = jobId || helper.loadData('applications/jobId');
      const selectedJob = helper.getItemByID(jobs, id) || jobs[0];
      return {
        jobs,
        jobId,
        selectedJob,
        searchText: state.applications.searchText
      };
    },
    {
      selectBusiness
    }
  )(Header)
);
