import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { Loading, FlexBox, MJPCard, JobseekerDetail } from 'components';

import * as helper from 'utils/helper';
import { confirm } from 'redux/common';
import { getApplications, selectApplication, connectApplication, removeApplication } from 'redux/applications';
import Wrapper from './Wrapper';

class MyApplications extends Component {
  state = {};

  componentWillMount() {
    this.appStatus = helper.getIDByName('appStatuses', 'CREATED');
    this.jobId = helper.str2int(this.props.match.params.jobId);
    this.onRefresh();

    this.tokens = helper.getItemByID(this.props.jobs, this.jobId).location_data.business_data.tokens;
  }

  componentWillReceiveProps(nextProps) {
    const jobId = helper.str2int(nextProps.match.params.jobId);
    if (this.jobId !== jobId) {
      this.jobId = jobId;
      this.onRefresh();

      this.tokens = helper.getItemByID(nextProps.jobs, this.jobId).location_data.business_data.tokens;
    }
  }

  onRefresh = () => this.props.getApplications(this.jobId, 'CREATED');

  onDetail = app => this.props.selectApplication(app);

  onConnect = app => {
    this.props.confirm('Confirm', 'Yes, I want to make this connection (1 credit)', [
      { outline: true },
      {
        label: 'Connect',
        color: 'green',
        onClick: () => this.props.connectApplication(app.id)
      }
    ]);
  };

  onRemove = app => {
    this.props.confirm('Confirm', 'Are you sure you want to delete this applicaton?', [
      { outline: true },
      {
        label: 'Remove',
        color: 'yellow',
        onClick: () => this.props.removeApplication(app.id)
      }
    ]);
  };

  render() {
    const { applications, selectedApp, errors } = this.props;

    if (!applications) {
      return <FlexBox center>{!errors ? <Loading /> : <div className="alert-msg">Server Error!</div>}</FlexBox>;
    }

    const createdApps = applications.filter(app => app.status === this.appStatus);

    if (createdApps.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {`No applications at the moment. Once that happens you can go trough them here,
              shortlist and easy switch to Find Talent mode and "head hunt" as well.`}
          </div>
        </FlexBox>
      );
    }

    return (
      <Wrapper>
        <Row>
          {createdApps.map(app => {
            const jobseeker = app.job_seeker;
            const image = helper.getJobseekerImg(jobseeker);
            const fullName = helper.getFullJSName(jobseeker);

            return (
              <Col xs="12" sm="6" md="4" lg="3" key={app.id}>
                <MJPCard
                  image={image}
                  title={fullName}
                  icon={app.shortlisted ? 'fa-star' : ''}
                  description={jobseeker.description}
                  onClick={() => this.onDetail(app)}
                  loading={app.loading}
                  menus={[
                    {
                      label: 'Connect',
                      color: 'green',
                      disabled: this.tokens === 0,
                      onClick: () => this.onConnect(app)
                    },
                    {
                      label: 'Remove',
                      color: 'yellow',
                      onClick: () => this.onRemove(app)
                    }
                  ]}
                />
              </Col>
            );
          })}
        </Row>

        {selectedApp && (
          <JobseekerDetail
            jobseeker={selectedApp.job_seeker}
            onClose={() => this.onDetail()}
            buttons={[
              {
                label: 'Connect',
                color: 'green',
                onClick: () => this.onConnect(selectedApp)
              },
              {
                label: 'Remove',
                color: 'yellow',
                onClick: () => this.onRemove(selectedApp)
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
    jobs: state.rc_jobs.jobs,
    applications: state.applications.applications,
    selectedApp: state.applications.selectedApp,
    errors: state.applications.errors
  }),
  {
    confirm,
    getApplications,
    selectApplication,
    connectApplication,
    removeApplication
  }
)(MyApplications);
