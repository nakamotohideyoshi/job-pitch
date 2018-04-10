import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Button, Modal, Icon } from 'antd';

import { getWorkplace } from 'redux/recruiter/workplaces';
import { getJobs, saveJob, removeJob } from 'redux/recruiter/jobs';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageSubHeader, AlertMsg, Loading, Logo } from 'components';
import Wrapper from './styled';

class JobList extends React.Component {
  state = {
    selectedJob: null
  };

  componentWillMount() {
    const { history, match, getWorkplace, getJobs, refreshList } = this.props;
    const workplaceId = parseInt(match.params.workplaceId, 10);
    getWorkplace({
      id: workplaceId,
      fail: () => history.replace('/recruiter/jobs/business')
    });

    if (refreshList) {
      getJobs({ id: workplaceId });
    }
  }

  selectJob = ({ id }) => {
    const { history } = this.props;
    history.push(`/recruiter/jobs/job/view/${id}`);
  };

  addJob = () => {
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
      >
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" />}
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
      </List.Item>
    );
  };

  renderJobs = () => {
    const { jobs, loading } = this.props;

    if (jobs.length === 0) {
      if (loading) {
        return <Loading size="large" />;
      }

      return (
        <AlertMsg>
          <span>{`Empty`}</span>
          {/* <a onClick={this.props.getJobs}>
        <FontAwesomeIcon icon={faSyncAlt} />
        Refresh
      </a> */}
        </AlertMsg>
      );
    }

    return <List itemLayout="horizontal" dataSource={jobs} loading={loading} renderItem={this.renderJob} />;

    // if (jobs.length === 0) {
    //   return (
    //     <FlexBox center>
    //       <div className="alert-msg">
    //         {DATA.jobsStep === 3
    //           ? 'Okay, last step, now create your first job'
    //           : "This workplace doesn't seem to have any jobs yet!"}
    //       </div>
    //       <a
    //         className="btn-link"
    //         onClick={() => {
    //           delete DATA.jobsStep;
    //           helper.saveData('jobs-step');
    //           this.onAdd();
    //         }}
    //       >
    //         Create job
    //       </a>
    //     </FlexBox>
    //   );
    // }

    //   return (
    //     <Row>
    //       {jobs.map(job => {
    //         const logo = helper.getJobLogo(job);
    //         const sector = helper.getNameByID('sectors', job.sector);
    //         const contract = helper.getNameByID('contracts', job.contract);
    //         const hours = helper.getNameByID('hours', job.hours);
    //         const closed = job.status === this.closedStatus ? 'closed' : '';

    //         return (
    //           <Col xs="12" sm="6" md="4" lg="3" key={job.id}>
    //             <MJPCard
    //               image={logo}
    //               title={job.title}
    //               tProperty1={contract}
    //               tProperty2={hours}
    //               bProperty1={sector}
    //               onClick={() => this.onSelect(job)}
    //               loading={job.updating || job.deleting}
    //               className={closed}
    //               menus={[
    //                 {
    //                   label: 'Edit',
    //                   onClick: () => this.onEdit(job)
    //                 },
    //                 {
    //                   label: 'Remove',
    //                   onClick: () => this.onRemove(job)
    //                 }
    //               ]}
    //             />
    //           </Col>
    //         );
    //       })}
    //       <Col xs="12" sm="6" md="4" lg="3">
    //         <Card body onClick={() => this.onAdd()} className="add">
    //           Add New Job
    //         </Card>
    //       </Col>
    //     </Row>
    //   );
  };

  render() {
    const { workplace, error } = this.props;
    const { id: workplaceId, business_data } = workplace || {};
    const { id: businessId } = business_data || {};
    const { selectedJob } = this.state;

    return (
      <Wrapper>
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
          <Link to={`/recruiter/jobs/job/add/${workplaceId}`}>Add Job</Link>
        </PageSubHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          this.renderJobs()
        )}

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
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    workplace: state.rc_workplaces.workplace,
    jobs: state.rc_jobs.jobs,
    loading: state.rc_jobs.loading,
    refreshList: state.rc_jobs.refreshList,
    error: state.rc_jobs.error
  }),
  {
    getWorkplace,
    getJobs,
    saveJob,
    removeJob
  }
)(JobList);
