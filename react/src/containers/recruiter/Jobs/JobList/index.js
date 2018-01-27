import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Loading, FlexBox, MJPCard } from 'components';

import * as helper from 'utils/helper';
import { SDATA } from 'utils/data';
import { confirm } from 'redux/common';
import { getJobs, saveJob, updateJob, removeJob } from 'redux/recruiter/jobs';
import Wrapper from './Wrapper';

class JobList extends React.Component {
  componentWillMount() {
    this.closedStatus = helper.getJobStatusByName('CLOSED');
    const workplaceId = helper.str2int(this.props.match.params.workplaceId);
    if (workplaceId) {
      this.props.getJobs(workplaceId);
    }
  }

  onSelect = job => {
    const { businessId, workplaceId } = this.props.match.params;
    this.props.history.push(`/recruiter/jobs/${businessId}/${workplaceId}/${job.id}`);
  };

  onAdd = () => {
    const { businessId, workplaceId } = this.props.match.params;
    this.props.history.push(`/recruiter/jobs/${businessId}/${workplaceId}/add`);
    // if (utils.getShared('first-time') === '3') {
    //   utils.setShared('first-time');
    //   this.setState({ firstTime: null });
    // }
  };

  onEdit = job => {
    const { businessId, workplaceId } = this.props.match.params;
    this.props.history.push(`/recruiter/jobs/${businessId}/${workplaceId}/${job.id}/edit`);
  };

  onRemove = job => {
    const buttons = [
      { outline: true },
      {
        label: 'Remove',
        color: 'yellow',
        onClick: () => this.props.removeJob(job.id)
      }
    ];

    if (job.status !== this.closedStatus) {
      buttons.push({
        label: 'Deactivate',
        color: 'yellow',
        onClick: () => {
          const model = Object.assign({}, job, { status: this.closedStatus });
          this.props.updateJob(model);
        }
      });
    }

    this.props.confirm('Confirm', `Are you sure you want to delete ${job.title}`, buttons);
  };

  renderJobs = () => {
    const { jobs } = this.props;

    if (jobs.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {SDATA.jobsStep === 3
              ? 'Okay, last step, now create your first job'
              : "This workplace doesn't seem to have any jobs yet!"}
          </div>
          <a
            className="btn-link"
            onClick={() => {
              delete SDATA.jobsStep;
              helper.saveData('jobs-step');
              this.onAdd();
            }}
          >
            Create workplace
          </a>
        </FlexBox>
      );
    }

    return (
      <Row>
        {jobs.map(job => {
          const logo = helper.getJobLogo(job);
          const sector = helper.getNameByID('sectors', job.sector);
          const contract = helper.getNameByID('contracts', job.contract);
          const hours = helper.getNameByID('hours', job.hours);
          const closed = job.status === this.closedStatus ? 'closed' : '';

          return (
            <Col xs="12" sm="6" md="4" lg="3" key={job.id}>
              <MJPCard
                image={logo}
                title={job.title}
                tProperty1={contract}
                tProperty2={hours}
                bProperty1={sector}
                onClick={() => this.onSelect(job)}
                loading={job.updating || job.deleting}
                menus={[
                  {
                    label: 'Edit',
                    onClick: () => this.onEdit(job)
                  },
                  {
                    label: 'Remove',
                    onClick: () => this.onRemove(job)
                  }
                ]}
              />
            </Col>
          );
        })}
        <Col xs="12" sm="6" md="4" lg="3">
          <Card body onClick={() => this.onAdd()} className="add">
            Add New Job
          </Card>
        </Col>
      </Row>
    );
  };
  render() {
    const { jobs, match, errors } = this.props;
    const { businessId } = match.params;

    return (
      <Wrapper>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/recruiter/jobs">Businesses</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/recruiter/jobs/${businessId}`}>Workplaces</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            Jobs
          </BreadcrumbItem>
        </Breadcrumb>

        {jobs ? (
          this.renderJobs()
        ) : !errors ? (
          <FlexBox center>
            <Loading />
          </FlexBox>
        ) : (
          <FlexBox center>
            <div className="alert-msg">Server Error!</div>
          </FlexBox>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobs: state.rc_jobs.jobs,
    errors: state.rc_jobs.errors
  }),
  {
    confirm,
    getJobs,
    saveJob,
    updateJob,
    removeJob
  }
)(JobList);
