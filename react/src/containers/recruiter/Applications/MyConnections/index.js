import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { Loading, FlexBox, MJPCard, JobseekerDetail } from 'components';

import * as helper from 'utils/helper';
import { confirm } from 'redux/common';
import { getApplications, selectApplication, removeApplication, setShortlist } from 'redux/applications';
import Wrapper from './Wrapper';

class MyConnections extends React.Component {
  state = {};

  componentWillMount() {
    this.appStatus = helper.getIDByName('appStatuses', 'ESTABLISHED');
    this.jobId = helper.str2int(this.props.match.params.jobId);
    this.onRefresh();
  }

  componentWillReceiveProps(nextProps) {
    const jobId = helper.str2int(nextProps.match.params.jobId);
    if (this.jobId !== jobId) {
      this.jobId = jobId;
      this.onRefresh();
    }
  }

  onRefresh = () => this.props.getApplications(this.jobId, 'ESTABLISHED');

  onDetail = app => this.props.selectApplication(app);

  onMessage = app => this.props.history.push(`/recruiter/messages/${app.id}/`);

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

    const connectedApps = applications.filter(app => app.status === this.appStatus);

    if (connectedApps.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {`No candidates have applied for this job yet.
              Once that happens, their applications will appear here.`}
          </div>
        </FlexBox>
      );
    }

    return (
      <Wrapper>
        <Row>
          {connectedApps.map(app => {
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
                      label: 'Message',
                      color: 'green',
                      onClick: () => this.onMessage(app)
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
            application={selectedApp}
            onChangeShortlist={this.props.setShortlist}
            jobseeker={selectedApp.job_seeker}
            onClose={() => this.onDetail()}
            buttons={[
              {
                label: 'Message',
                color: 'green',
                onClick: () => this.onMessage(selectedApp)
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
    applications: state.applications.applications,
    selectedApp: state.applications.selectedApp,
    errors: state.applications.errors
  }),
  {
    confirm,
    getApplications,
    selectApplication,
    removeApplication,
    setShortlist
  }
)(MyConnections);
