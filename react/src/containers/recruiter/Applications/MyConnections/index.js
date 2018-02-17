import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import faStar from '@fortawesome/fontawesome-free-regular/faStar';
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

  onDetail = appId => this.props.selectApplication(appId);

  onMessage = appId => this.props.history.push(`/recruiter/messages/${appId}/`);

  onRemove = appId => {
    this.props.confirm('Confirm', 'Are you sure you want to delete this applicaton?', [
      { outline: true },
      {
        label: 'Remove',
        color: 'yellow',
        onClick: () => this.props.removeApplication(appId)
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
                  icon={app.shortlisted ? faStar : ''}
                  description={jobseeker.description}
                  onClick={() => this.onDetail(app.id)}
                  loading={app.loading}
                  menus={[
                    {
                      label: 'Message',
                      color: 'green',
                      onClick: () => this.onMessage(app.id)
                    },
                    {
                      label: 'Remove',
                      color: 'yellow',
                      onClick: () => this.onRemove(app.id)
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
                onClick: () => this.onMessage(selectedApp.id)
              },
              {
                label: 'Remove',
                color: 'yellow',
                onClick: () => this.onRemove(selectedApp.id)
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