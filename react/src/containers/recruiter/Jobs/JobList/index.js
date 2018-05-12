import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Avatar, Tooltip } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons } from 'components';
import DeleteDialog from './DeleteDialog';
import Wrapper from '../styled';

class JobList extends React.Component {
  state = {
    selectedJob: null
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

  renderJob = job => {
    const { id, status, title, sector, contract, hours, description, loading } = job;
    const logo = helper.getJobLogo(job);
    const sectorName = helper.getItemByID(DATA.sectors, sector).name;
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const closed = status === DATA.JOB.CLOSED ? 'deleted' : '';

    return (
      <List.Item
        key={id}
        actions={[
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
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Avatar src={logo} className="avatar-80" />} title={title} description={description} />
        <div className="properties">
          <span className={closed} style={{ width: '60px' }}>
            {contractName}
          </span>
          <span className={closed} style={{ width: '60px' }}>
            {hoursName}
          </span>
          <span className={closed}>{sectorName}</span>
        </div>
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
    const { selectedJob } = this.state;

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
      </Wrapper>
    );
  }
}

export default connect((state, { match }) => {
  const workplaceId = helper.str2int(match.params.workplaceId);
  const workplace = helper.getItemByID(state.rc_workplaces.workplaces, workplaceId);
  let { jobs } = state.rc_jobs;
  jobs = jobs.filter(item => item.location === workplaceId);
  helper.sort(jobs, 'title');
  return {
    workplace,
    jobs
  };
})(JobList);
