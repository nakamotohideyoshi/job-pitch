import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Spin } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getJobsSelector } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { updateJobAction } from 'redux/recruiter/jobs';
import { PageHeader, PageSubHeader } from 'components';
import DeleteDialog from '../JobList/DeleteDialog';
import Wrapper from '../styled';
import Details from './styled';

/* eslint-disable react/prop-types */
class JobInterface extends React.Component {
  state = {
    visibleDialog: false
  };

  componentDidMount() {
    const { job, selectBusinessAction, history } = this.props;
    if (job) {
      selectBusinessAction(job.location_data.business);
    } else {
      history.replace('/recruiter/jobs/business');
    }
  }

  componentWillReceiveProps(nextProps) {
    const { job, history } = this.props;
    if (job && !nextProps.job) {
      history.push(`/recruiter/jobs/job/${job.location}`);
    }
  }

  showDeleteDialog = visibleDialog => {
    this.setState({ visibleDialog });
  };

  reactivateJob = () => {
    const { id, title } = this.props.job;
    this.props.updateJobAction({
      id,
      data: {
        status: DATA.JOB.OPEN
      },
      successMsg: `${title} is opened.`,
      failMsg: `Opening ${title} is failed.`
    });
  };

  renderDetails = () => {
    const { job, history } = this.props;
    const { id, status, title } = job;
    const closed = status === DATA.JOB.CLOSED;

    return (
      <Details className="content">
        <div>
          <h3>{title}</h3>
          <span>{closed ? '( CLOSED )' : ''}</span>
        </div>

        <Button type="primary" onClick={() => history.push(`/recruiter/jobs/job/edit/${id}`)}>
          Edit
        </Button>

        <Button type="primary" onClick={() => this.showDeleteDialog(true)}>
          Delete
        </Button>

        {closed && (
          <Button type="primary" onClick={this.reactivateJob}>
            Reactivate
          </Button>
        )}

        <Button type="primary" disabled={closed} onClick={() => history.push(`/recruiter/applications/find/${id}`)}>
          Find talent
        </Button>

        <Button type="primary" disabled={closed} onClick={() => history.push(`/recruiter/applications/apps/${id}`)}>
          Applications
        </Button>

        <Button type="primary" disabled={closed} onClick={() => history.push(`/recruiter/applications/conns/${id}`)}>
          Connections
        </Button>

        <Button
          type="primary"
          disabled={closed}
          onClick={() => history.push(`/recruiter/applications/shortlist/${id}`)}
        >
          Shortlist
        </Button>
      </Details>
    );
  };

  render() {
    const { job } = this.props;

    if (!job) return null;

    const { location_data, location, loading } = job;

    return (
      <Wrapper className="container">
        <Helmet title="Job Details" />

        <PageHeader>
          <h2>Job Details</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/workplace/${location_data.business}`}>Workplaces</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/job/${location}`}>Jobs</Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item>Details</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        {loading ? <Spin>{this.renderDetails()}</Spin> : this.renderDetails()}

        <DeleteDialog job={job} visible={this.state.visibleDialog} onCancel={() => this.showDeleteDialog()} />
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemById(getJobsSelector(state), jobId);
    return {
      job
    };
  },
  {
    selectBusinessAction,
    updateJobAction
  }
)(JobInterface);
