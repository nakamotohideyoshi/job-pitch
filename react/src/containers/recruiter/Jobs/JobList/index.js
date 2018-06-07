import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Truncate from 'react-truncate';
import { Breadcrumb, List, Avatar, Tooltip, Modal, Input } from 'antd';
import styled, { css } from 'styled-components';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import * as _ from 'lodash';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons, ShareLink } from 'components';
import DeleteDialog from './DeleteDialog';
import Mark from './Mark';
import Wrapper from '../styled';

const StyledModal = styled(Modal)`
  .ant-input-group-addon {
    cursor: pointer;
  }

  .ant-form-explain {
    margin-top: 8px;
  }
`;

class JobList extends React.Component {
  state = {
    selectedJob: null,
    showDialog: false,
    selected: '',
    countList: null
  };

  componentDidMount() {
    let countList = {};
    _.forEach(this.props.jobs, job => {
      let applications = _.filter(DATA.applications, application => {
        return application.job === job.id && application.status === 1;
      });
      let newApplications = _.filter(DATA.applications, application => {
        return application.job === job.id && application.status === 1;
      });
      let connections = _.filter(DATA.applications, application => {
        return application.job === job.id && application.status === 2;
      });
      countList[job.id] = {
        totalApplications: applications.length,
        newApplications: newApplications.length,
        connections: connections.length
      };
    });
    this.setState({
      countList: countList
    });
  }

  copyLink = event => {
    event && event.stopPropagation();
    this.inputRef.input.select();
    document.execCommand('Copy');
  };

  openDialog(event, id) {
    event && event.stopPropagation();
    this.setState({ showDialog: true, selected: id });
  }

  closeDialog = event => {
    event && event.stopPropagation();
    this.setState({ showDialog: false });
  };

  componentWillMount() {
    const { workplace, history } = this.props;
    if (!workplace) {
      history.replace('/recruiter/jobs/business');
    }
  }

  selectJob = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/job/view/${id}`);
  };

  addJob = () => {
    helper.saveData('tutorial');
    const { workplace: { id }, history } = this.props;
    history.push(`/recruiter/jobs/job/add/${id}`);
  };

  editJob = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/job/edit/${id}`);
  };

  showRemoveDialog = (selectedJob, event) => {
    event && event.stopPropagation();
    this.setState({ selectedJob });
  };

  showApps = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/applications/apps/${id}`);
  };

  showCons = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/applications/conns/${id}`);
  };

  renderJob = job => {
    const { id, status, title, sector, contract, hours, description, loading } = job;
    const logo = helper.getJobLogo(job);
    const sectorName = helper.getItemByID(DATA.sectors, sector).name;
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const closed = status === DATA.JOB.CLOSED ? 'disabled' : '';
    var width = '90px';
    if (this.state.countList !== null) {
      var count = this.state.countList[job.id];
      var strApplications = `${count.totalApplications} application${count.totalApplications > 1 ? 's' : ''}`;
      var strNewApplications = `(${count.newApplications} new)`;
      var strConnections = `${count.connections} connection${count.connections > 1 ? 's' : ''}`;
      if (count.totalApplications < 2) {
        width = '80px';
      }
    }

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Share Job">
            <span onClick={e => this.openDialog(e, id)}>
              <Icons.ShareAlt />
            </span>
            {/* <ShareLink url={`${window.location.origin}/jobseeker/jobs/${id}`} /> */}
          </Tooltip>,
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.editJob(job, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.showRemoveDialog(job, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.selectJob(job)}
        className={`${loading ? 'loading' : ''} ${closed}`}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={title}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {description}
            </Truncate>
          }
        />
        {/* <div className="properties">
          <span style={{ width: '60px' }}>{contractName}</span>
          <span style={{ width: '60px' }}>{hoursName}</span>
          <span>{sectorName}</span>
        </div> */}
        <div className="properties">
          <span style={{ width: width, color: '#ff9300' }} onClick={e => this.showApps(job, e)}>
            {strApplications}
          </span>
          {/* {count && count.newApplications && count.newApplications > 0 ? (
            <span style={{ width: '60px', color: '#ff9300' }}>{strNewApplications}</span>
          ) : (
            ''
          )} */}
          <span style={{ width: '80px', color: '#00b6a4' }} onClick={e => this.showCons(job, e)}>
            {strConnections}
          </span>
        </div>
        {closed && <Mark>Inactive</Mark>}
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    const tutorial = helper.loadData('tutorial');
    return (
      <AlertMsg>
        <span>
          {tutorial === 3
            ? `Okay, last step, now create your first job`
            : `This workplace doesn't seem to have any jobs yet!`}
        </span>
        <a onClick={this.addJob}>Create job</a>
      </AlertMsg>
    );
  };

  render() {
    const { workplace, jobs } = this.props;
    const { selectedJob, selected } = this.state;

    return (
      <Wrapper className="container">
        <Helmet title="My Jobs" />

        <PageHeader>
          <h2>My Jobs</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {workplace && <Link to={`/recruiter/jobs/workplace/${workplace.business_data.id}`}>Workplaces</Link>}
            </Breadcrumb.Item>
            <Breadcrumb.Item>Jobs</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addJob}>Add new job</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={jobs}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderJob}
            emptyRender={this.renderEmpty}
          />
        </div>

        <DeleteDialog job={selectedJob} onCancel={() => this.showRemoveDialog()} />
        <StyledModal visible={this.state.showDialog} title={'Share Link'} footer={null} onCancel={this.closeDialog}>
          <Input
            readOnly
            addonAfter={<div onClick={this.copyLink}>Copy link</div>}
            value={`${window.location.origin}/jobseeker/jobs/${selected}`}
            ref={ref => {
              this.inputRef = ref;
            }}
            id={selected}
          />
          <div className="ant-form-explain">{'Share this link on your website, in an email, or anywhere else.'}</div>
        </StyledModal>
      </Wrapper>
    );
  }
}

export default connect((state, { match }) => {
  const workplaceId = helper.str2int(match.params.workplaceId);
  const workplace = helper.getItemByID(state.rc_workplaces.workplaces, workplaceId);
  let { jobs } = state.rc_jobs;
  jobs = jobs.filter(item => item.location === workplaceId);
  return {
    workplace,
    jobs
  };
})(JobList);
