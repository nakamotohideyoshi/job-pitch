import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';

// import { Board, Loading, Alert } from 'components';
// import { confirm } from 'redux/common';
// import { getJob, updateJob, removeJob } from 'redux/recruiter/jobs';
// import * as helper from 'utils/helper';
import Wrapper from './styled';

class JobInterface extends React.Component {
  // componentWillMount() {
  //   this.closedStatus = helper.getJobStatusByName('CLOSED');
  //   const jobId = parseInt(this.props.match.params.jobId, 10);
  //   this.props.getJob(jobId);
  // }

  // removeJob = () => {
  //   const { job } = this.props;
  //   const buttons = [
  //     { outline: true },
  //     {
  //       label: 'Remove',
  //       color: 'yellow',
  //       onClick: () => this.props.removeJob(job.id)
  //     }
  //   ];

  //   if (job.status !== this.closedStatus) {
  //     buttons.push({
  //       label: 'Deactivate',
  //       color: 'yellow',
  //       onClick: () => {
  //         const model = Object.assign({}, job, { status: this.closedStatus });
  //         this.props.updateJob(model);
  //       }
  //     });
  //   }

  //   this.props.confirm('Confirm', `Are you sure you want to delete ${job.title}`, buttons);
  // };

  // reactivateJob = () => {
  //   const model = Object.assign({}, this.props.job, {
  //     status: helper.getJobStatusByName('OPEN')
  //   });
  //   this.props.updateJob(model);
  // };

  render() {
    // const { job, errors, match, history } = this.props;
    // const { businessId, workplaceId } = match.params;
    // const closed = job && job.status === this.closedStatus;

    return (
      <Wrapper>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs">Businesses</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs">Workplaces</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/recruiter/jobs">Jobs</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Job Detail</Breadcrumb.Item>
        </Breadcrumb>

        {/* <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/recruiter/jobs">Businesses</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/recruiter/jobs/${businessId}`}>Workplaces</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/recruiter/jobs/${businessId}/${workplaceId}`}>Jobs</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            Detail
          </BreadcrumbItem>
        </Breadcrumb> */}

        {/* {job ? (
          <Board block className="board">
            <h3>{job.title}</h3>

            <div className="buttons">
              <Button
                color="green"
                onClick={() => history.push(`/recruiter/jobs/${businessId}/${workplaceId}/${job.id}/edit`)}
              >
                Edit
              </Button>

              <Button color="green" onClick={this.removeJob}>
                {job.deleting ? 'Deleting...' : 'Delete'}
              </Button>

              {closed && (
                <Button color="green" onClick={this.reactivateJob}>
                  {job.updating ? 'Reactivating...' : 'Reactivate'}
                </Button>
              )}

              <Button
                color="green"
                disabled={closed}
                onClick={() => history.push(`/recruiter/applications/find/${job.id}`)}
              >
                Find talent
              </Button>

              <Button
                color="green"
                disabled={closed}
                onClick={() => history.push(`/recruiter/applications/apps/${job.id}`)}
              >
                Applications
              </Button>

              <Button
                color="green"
                disabled={closed}
                onClick={() => history.push(`/recruiter/applications/conns/${job.id}`)}
              >
                Connections
              </Button>

              <Button
                color="green"
                disabled={closed}
                onClick={() => history.push(`/recruiter/applications/shortlist/${job.id}`)}
              >
                Shortlist
              </Button>
            </div>
            <span>{closed ? 'CLOSED' : ''}</span>
          </Board>
        ) : !errors ? (
          <Loading />
        ) : (
          <Alert type="danger">Error!</Alert>
        )} */}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    // job: state.rc_jobs.selectedJob
  }),
  {
    // confirm,
    // getJob,
    // updateJob,
    // removeJob
  }
)(JobInterface);
