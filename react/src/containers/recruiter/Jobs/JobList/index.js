import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Modal, Avatar, Button, Icon } from 'antd';

import { getWorkplace } from 'redux/recruiter/workplaces';
import { getJobs, saveJob, removeJob } from 'redux/recruiter/jobs';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageSubHeader, AlertMsg, LinkButton, Loading, ListEx } from 'components';

class JobList extends React.Component {
  state = {
    selectedJob: null
  };

  componentWillMount() {
    const { match, getJobs, jobs } = this.props;
    const workplaceId = parseInt(match.params.workplaceId, 10);
    // if (!jobs) {
    //   getWorkplace();
    // }

    if (!jobs) {
      getJobs();
    }
  }

  selectJob = ({ id }) => {
    const { history } = this.props;
    history.push(`/recruiter/jobs/job/view/${id}`);
  };

  addJob = () => {
    helper.saveData('tutorial');
    const { history, workplace } = this.props;
    history.push(`/recruiter/jobs/job/add/${workplace.id}`);
  };

  editJob = ({ id }, e) => {
    e && e.stopPropagation();

    const { history } = this.props;
    history.push(`/recruiter/jobs/job/edit/${id}`);
  };

  showRemoveDialog = (selectedJob, e) => {
    e && e.stopPropagation();
    this.setState({ selectedJob });
  };

  removeJob = () => {
    const { removeJob } = this.props;
    removeJob({
      id: this.state.selectedJob.id
    });
    this.showRemoveDialog();
  };

  deactivateJob = () => {
    const { getJobs, saveJob, workplace } = this.props;
    saveJob({
      data: {
        ...this.state.selectedJob,
        status: DATA.jobClosed
      },
      onSuccess: () => getJobs({ id: workplace.id })
    });
    this.showRemoveDialog();
  };

  renderJob = job => {
    const logo = helper.getJobLogo(job);
    const sector = helper.getItemByID(DATA.sectors, job.sector).name;
    const contract = helper.getItemByID(DATA.contracts, job.contract).short_name;
    const hours = helper.getItemByID(DATA.hours, job.hours).short_name;
    const closed = job.status === DATA.jobClosed ? 'closed' : '';

    return (
      <List.Item
        key={job.id}
        actions={[
          <span onClick={e => this.editJob(job, e)}>Edit</span>,
          <span onClick={e => this.showRemoveDialog(job, e)}>Remove</span>
        ]}
        onClick={() => this.selectJob(job)}
        className={job.loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={<span className={closed}>{`${job.title}`}</span>}
          description={
            <div className={closed}>
              <div className="properties">
                <span className="contract">{contract}</span>
                <span className="hours">{hours}</span>
                <span className="sector">{sector}</span>
              </div>
              <div className={closed}>{job.description}</div>
            </div>
          }
        />
        {job.loading && <Loading className="mask" size="small" />}
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
    const { workplace, jobs, error } = this.props;
    const { id: workplaceId, business_data } = workplace || {};
    const { id: businessId } = business_data || {};
    const { selectedJob } = this.state;

    return (
      <Fragment>
        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/workplace/${businessId}`}>Workplaces</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Jobs</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addJob}>Add Job</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={jobs}
            error={error && 'Server Error!'}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderJob}
            emptyRender={this.renderEmpty}
          />
        </div>

        <Modal
          className="ant-confirm ant-confirm-confirm"
          style={{ width: '300px' }}
          closable={false}
          maskClosable={true}
          title={null}
          visible={!!selectedJob}
          footer={null}
          onCancel={() => this.showRemoveDialog()}
        >
          <div className="ant-confirm-body-wrapper">
            <div className="ant-confirm-body">
              <Icon type="question-circle" />
              <span className="ant-confirm-title">{`Are you sure you want to delete ${
                (selectedJob || {}).title
              }`}</span>
            </div>
            <div className="ant-confirm-btns">
              <Button onClick={() => this.showRemoveDialog()}>Cancel</Button>
              <Button type="danger" onClick={this.removeJob}>
                Remove
              </Button>
              {(selectedJob || {}).status === DATA.JOB.OPEN && (
                <Button type="danger" onClick={this.deactivateJob}>
                  Deactivate
                </Button>
              )}
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    workplace: state.rc_workplaces.workplace,
    jobs: state.rc_jobs.jobs,
    error: state.rc_jobs.error
  }),
  {
    getWorkplace,
    getJobs,
    saveJob,
    removeJob
  }
)(JobList);
