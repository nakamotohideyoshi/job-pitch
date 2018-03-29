import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Select, Spin, message } from 'antd';
import styled from 'styled-components';

import { PageHeader, SearchBox, Logo } from 'components';

import * as helper from 'utils/helper';
import { updateStatus, getOpenedJobs } from 'redux/recruiter/apps';
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
      this.props.getOpenedJobs({
        success: () => this.selectJob(),
        fail: () => message.error('Server Eror')
      });
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
    const { jobs, selectedJobId, loadingJobs, searchText, match } = this.props;
    const selectedKey = match.url.split('/')[3];

    return (
      <Wrapper>
        <Helmet title="Applications" />

        <PageHeader>
          <h2>Applications</h2>
        </PageHeader>

        <Menu mode="horizontal" selectedKeys={[selectedKey]}>
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
        </Menu>

        <div className="filters">
          <Select
            showSearch
            value={selectedJobId}
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
      selectedJobId: state.rc_apps.selectedJobId,
      loadingJobs: state.rc_apps.loadingJobs,
      searchText: state.rc_apps.searchText
    }),
    {
      updateStatus,
      getOpenedJobs,
      selectBusiness
    }
  )(Header)
);
