import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Switch, Route, Link } from 'react-router-dom';
import { Nav, NavItem } from 'reactstrap';
import { PageHeader, FlexBox, JobSelect } from 'components';

import * as helper from 'utils/helper';
import { getJobs } from 'redux/recruiter/jobs';
import FindTalent from './FindTalent';
import MyApplications from './MyApplications';
import MyConnections from './MyConnections';
import MyShortlist from './MyShortlist';
import Container from './Wrapper';

class Applications extends React.Component {
  state = {};

  componentWillMount() {
    this.props.getJobs();
  }

  onSelectJob = job => {
    const pathinfo = this.props.location.pathname.split('/');
    pathinfo[3] = pathinfo[3] || 'find';
    pathinfo[4] = job.id;
    this.props.history.push(pathinfo.join('/'));
    helper.saveData('selected_job', job.id);
  };

  routers = jobId => {
    const { jobs } = this.props;
    if (jobs.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">You have not added any jobs yet.</div>
          <Link className="btn-link" to="/recruiter/jobs">
            Create job
          </Link>
        </FlexBox>
      );
    }

    const selectedJob = helper.getItemByID(jobs, parseInt(jobId, 10));
    if (!selectedJob) {
      return (
        <FlexBox center>
          <div className="alert-msg">Please select a job.</div>
        </FlexBox>
      );
    }

    const base = this.props.match.path;
    return (
      <Switch>
        <Route exact path={`${base}/find/:jobId`} component={FindTalent} />
        <Route exact path={`${base}/apps/:jobId`} component={MyApplications} />
        <Route exact path={`${base}/conns/:jobId`} component={MyConnections} />
        <Route exact path={`${base}/shortlist/:jobId`} component={MyShortlist} />
      </Switch>
    );
  };

  render() {
    const { jobs } = this.props;
    const base = this.props.match.path;
    const pathinfo = this.props.location.pathname.split('/');
    const tabkey = pathinfo[3];
    const jobId = pathinfo[4] || '';

    return (
      <Fragment>
        <Helmet title="Applications" />

        <Container>
          <PageHeader>Applications</PageHeader>

          <JobSelect clearable={false} options={jobs} value={jobId} onChange={this.onSelectJob} size="60" />

          <div className="tab-container">
            <Nav tabs>
              <NavItem active={tabkey === 'find'}>
                <Link to={`${base}/find/${jobId}`}>FIND TALENT</Link>
              </NavItem>
              <NavItem active={tabkey === 'apps'}>
                <Link to={`${base}/apps/${jobId}`}>MY APPLICATIONS</Link>
              </NavItem>
              <NavItem active={tabkey === 'conns'}>
                <Link to={`${base}/conns/${jobId}`}>MY CONNECTIONS</Link>
              </NavItem>
              <NavItem active={tabkey === 'shortlist'}>
                <Link to={`${base}/shortlist/${jobId}`}>MY SHORTLIST</Link>
              </NavItem>
            </Nav>

            <div className="tab-content">{jobs && this.routers(jobId)}</div>
          </div>
        </Container>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    jobs: state.rc_jobs.jobs
  }),
  {
    getJobs
  }
)(Applications);
