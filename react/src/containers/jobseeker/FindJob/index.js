import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { PageHeader, SearchBar, Loading, FlexBox, MJPCard, JobDetail } from 'components';

import * as helper from 'utils/helper';
import { SDATA } from 'utils/data';
import { confirm } from 'redux/common';
import { getJobs, applyJob, removeJob } from 'redux/jobseeker/find';
import Wrapper from './Wrapper';

import NoPitch from '../NoPitch';

class FindJob extends Component {
  state = {};

  componentWillMount() {
    this.onRefresh();
  }

  onRefresh = () => this.props.getJobs();

  onDetail = selectedJob => this.setState({ selectedJob });

  onApply = job => {
    const { confirm, jobseeker, applyJob } = this.props;

    if (jobseeker.pitches.length === 0) {
      confirm('Alert', 'You need to record your pitch video to apply.', [
        { outline: true },
        {
          label: 'Record my pitch',
          color: 'green',
          onClick: () => {
            this.props.history.push('/jobseeker/record');
          }
        }
      ]);
    } else {
      confirm('Confirm', 'Yes, I want to apply to this job', [
        { outline: true },
        {
          label: 'Apply',
          color: 'green',
          onClick: () => applyJob(job.id)
        }
      ]);
    }
  };

  onRemove = job => {
    this.props.confirm('Confirm', 'Are you sure you are not interested in this job?', [
      { outline: true },
      {
        label: "I'm Sure",
        color: 'yellow',
        onClick: () => this.props.removeJob(job.id)
      }
    ]);
  };

  filterApp = filterText => this.setState({ filterText });

  renderJobs = () => {
    const { jobs, profile } = this.props;

    if (jobs.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {`There are no more jobs that match your profile.
            You can restore your removed matches by clicking refresh.`}
          </div>
          <a className="btn-link" onClick={this.onRefresh}>
            <i className="fa fa-refresh" />
            Refresh
          </a>
        </FlexBox>
      );
    }

    const { filterText } = this.state;
    const filteredJobs = jobs.filter(
      job =>
        !filterText ||
        job.title.toLowerCase().indexOf(filterText) !== -1 ||
        job.location_data.name.toLowerCase().indexOf(filterText) !== -1 ||
        job.location_data.business_data.name.toLowerCase().indexOf(filterText) !== -1
    );

    if (filteredJobs.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            <i className="fa fa-search" />
            No search results
          </div>
        </FlexBox>
      );
    }

    return (
      <Row>
        {filteredJobs.map(job => {
          const logo = helper.getJobLogo(job);
          const businessName = helper.getFullBWName(job);
          const contract = helper.getItemByID(SDATA.contracts, job.contract).short_name;
          const hours = helper.getItemByID(SDATA.hours, job.hours).short_name;
          const distance = helper.getDistanceFromLatLonEx(
            job.location_data.latitude,
            job.location_data.longitude,
            profile.latitude,
            profile.longitude
          );

          return (
            <Col xs="12" sm="6" md="4" lg="3" key={job.id}>
              <MJPCard
                image={logo}
                title={job.title}
                tProperty1={businessName}
                // description={job.description}
                bProperty1={`${contract} / ${hours}`}
                bProperty2={distance}
                onClick={() => this.onDetail(job)}
                loading={job.loading}
                menus={[
                  {
                    label: 'Apply',
                    onClick: () => this.onApply(job)
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
      </Row>
    );
  };

  render() {
    const { jobs, errors, jobseeker } = this.props;
    const { selectedJob } = this.state;

    if (jobseeker) {
      if (!helper.getPitch(jobseeker)) {
        return <NoPitch />;
      }
    }

    return (
      <Wrapper>
        <Helmet title="Find Me Jobs" />

        <Container>
          {jobs && (
            <PageHeader>
              <span>Find Me Jobs</span>
              <SearchBar size="sm" onChange={this.filterApp} />
            </PageHeader>
          )}
          {jobs && this.renderJobs()}
          {!jobs && <FlexBox center>{!errors ? <Loading /> : <div className="alert-msg">Server Error!</div>}</FlexBox>}
        </Container>

        {selectedJob && (
          <JobDetail
            job={selectedJob}
            onClose={() => this.onDetail()}
            buttons={[
              {
                label: 'Connect',
                color: 'green',
                onClick: () => this.onApply(selectedJob)
              },
              {
                label: 'Remove',
                color: 'yellow',
                onClick: () => this.onRemove(selectedJob)
              }
            ]}
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_find.jobseeker,
    profile: state.js_find.profile,
    jobs: state.js_find.jobs,
    selectedJob: state.js_find.selectedJob,
    errors: state.js_find.errors
  }),
  {
    confirm,
    getJobs,
    applyJob,
    removeJob
  }
)(FindJob);
