import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Select, Spin } from 'antd';
import styled from 'styled-components';

import { PageHeader, SearchBox, Logo } from 'components';

import * as helper from 'utils/helper';
import { updateStatus, getAllJobs } from 'redux/recruiter/apps';
import { selectBusiness } from 'redux/recruiter/businesses';

const Option = Select.Option;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .ant-menu {
    line-height: 38px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 30px;
  }

  .filters {
    display: flex;

    .ant-select {
      flex: 1;
      margin-right: 20px;

      .ant-select-selection-selected-value .logo {
        float: left;
        margin: 4px 8px 0 0;
      }
    }
  }
`;

class Header extends React.Component {
  componentWillMount() {
    if (this.props.jobs.length) {
      this.selectJob();
    } else {
      this.props.getAllJobs({
        success: () => this.selectJob()
      });
    }
  }

  selectJob = jobId => {
    const { history, match, jobs, selectBusiness } = this.props;
    this.jobId = jobId;
    if (!this.jobId) {
      this.jobId = helper.str2int(match.params.jobId) || helper.loadData('applications/jobId');
    }

    const job = helper.getItemByID(jobs, this.jobId) || jobs[0];
    if (job) {
      selectBusiness({
        business: job.location_data.business_data
      });
    }

    this.jobId = (job || {}).id;
    helper.saveData('applications/jobId', this.jobId);

    const arr = match.url.split('/');
    arr[4] = this.jobId;
    history.replace(arr.join('/'));
  };

  changeSearch = searchText => this.props.updateStatus({ searchText });

  render() {
    const { jobs, loadingJobs, searchText, match } = this.props;
    const selectedKey = match.url.split('/')[3];
    const jobId = this.jobId || '';

    return (
      <Wrapper>
        <Helmet title="Applications" />

        <PageHeader>
          <h2>Applications</h2>
        </PageHeader>

        <Menu mode="horizontal" selectedKeys={[selectedKey]}>
          <Menu.Item key="find">
            <Link to={`/recruiter/applications/find/${jobId}`}>Find Talent</Link>
          </Menu.Item>
          <Menu.Item key="apps">
            <Link to={`/recruiter/applications/apps/${jobId}`}>My Applications</Link>
          </Menu.Item>
          <Menu.Item key="conns">
            <Link to={`/recruiter/applications/conns/${jobId}`}>My Connections</Link>
          </Menu.Item>
          <Menu.Item key="shortlist">
            <Link to={`/recruiter/applications/shortlist/${jobId}`}>My Shortlist</Link>
          </Menu.Item>
        </Menu>

        <div className="filters">
          <Select
            showSearch
            value={jobId}
            placeholder={loadingJobs ? <Spin size="small" /> : 'Select a job'}
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
        </div>
      </Wrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      jobs: state.rc_apps.jobs,
      loadingJobs: state.rc_apps.loadingJobs,
      searchText: state.rc_apps.searchText
    }),
    {
      updateStatus,
      getAllJobs,
      selectBusiness
    }
  )(Header)
);
