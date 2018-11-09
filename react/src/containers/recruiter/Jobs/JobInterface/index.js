import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Spin } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getJobsSelector } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { saveJobAction } from 'redux/recruiter/jobs';
import { PageHeader, PageSubHeader } from 'components';
import DeleteDialog from '../JobList/DeleteDialog';
import Wrapper from '../styled';
import Details from './styled';

/* eslint-disable react/prop-types */
class JobInterface extends React.Component {
  state = {
    showDialog: false
  };

  componentDidMount() {
    const { job, selectBusinessAction, history } = this.props;
    if (!job) {
      history.push('/recruiter/jobs/business');
    } else {
      selectBusinessAction(job.location_data.business);
      this.workplaceId = job.location;
    }
  }

  componentWillReceiveProps({ job }) {
    if (!job) {
      this.props.history.push(`/recruiter/jobs/job/${this.workplaceId}`);
    }
  }

  showRemoveDialog = show => {
    this.setState({ showDialog: show });
  };

  reactivateJob = () => {
    const { job } = this.props;
    this.props.saveJobAction({
      data: {
        ...job,
        status: DATA.JOB.OPEN
      },
      successMsg: `${job.title} is opened.`,
      failMsg: `Opening ${job.title} is failed.`
    });
  };

  renderDetails = () => {
    const { showDialog } = this.state;
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

        <Button type="primary" onClick={() => this.showRemoveDialog(true)}>
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

        <DeleteDialog job={showDialog && job} onCancel={() => this.showRemoveDialog()} />
      </Details>
    );
  };

  render() {
    const { job } = this.props;
    if (!job) {
      return null;
    }

    const { location_data, loading } = job;
    const { business_data } = location_data;

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
              <Link to={`/recruiter/jobs/workplace/${business_data.id}`}>Workplaces</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/recruiter/jobs/job/${location_data.id}`}>Jobs</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Details</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        {loading ? <Spin>{this.renderDetails()}</Spin> : this.renderDetails()}
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
    saveJobAction
  }
)(JobInterface);
