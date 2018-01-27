import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { Loading, FlexBox, MJPCard, JobseekerDetail } from 'components';

import * as helper from 'utils/helper';
import { confirm } from 'redux/common';
import { getJobseekers, selectJobseeker, connectJobseeker, removeJobseeker } from 'redux/recruiter/find';
import Wrapper from './Wrapper';

class FindTalent extends React.Component {
  state = {};

  componentWillMount() {
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

  onRefresh = () => this.props.getJobseekers(this.jobId);

  onDetail = jobseeker => this.props.selectJobseeker(jobseeker);

  onConnect = jobseeker => {
    this.props.confirm('Confirm', 'Are you sure you want to connect this talent? (1 credit)', [
      { outline: true },
      {
        label: 'Connect',
        color: 'green',
        onClick: () => this.props.connectJobseeker(jobseeker.id, this.jobId)
      }
    ]);
  };

  onRemove = jobseeker => {
    this.props.confirm('Confirm', `Are you sure you want to delete this talent?`, [
      { outline: true },
      {
        label: 'Remove',
        color: 'yellow',
        onClick: () => this.props.removeJobseeker(jobseeker.id)
      }
    ]);
  };

  render() {
    const { jobseekers, selectedJobseeker, errors } = this.props;

    if (!jobseekers) {
      return <FlexBox center>{!errors ? <Loading /> : <div className="alert-msg">Server Error!</div>}</FlexBox>;
    }

    if (jobseekers.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {`There are no more new matches for this job.
              You can restore your removed matches by clicking refresh above.`}
          </div>
          <a className="btn-link" onClick={this.onRefresh}>
            <i className="fa fa-refresh" />
            Refresh
          </a>
        </FlexBox>
      );
    }

    return (
      <Wrapper>
        <Row>
          {jobseekers.map(jobseeker => {
            const image = helper.getJobseekerImg(jobseeker);
            const fullName = helper.getFullJSName(jobseeker);
            return (
              <Col xs="12" sm="6" md="4" lg="3" key={jobseeker.id}>
                <MJPCard
                  image={image}
                  title={fullName}
                  description={jobseeker.description}
                  onClick={() => this.onDetail(jobseeker)}
                  loading={jobseeker.loading}
                  menus={[
                    {
                      label: 'Connect',
                      color: 'green',
                      disabled: this.tokens === 0,
                      onClick: () => this.onConnect(jobseeker)
                    },
                    {
                      label: 'Remove',
                      color: 'yellow',
                      onClick: () => this.onRemove(jobseeker)
                    }
                  ]}
                />
              </Col>
            );
          })}
        </Row>

        {selectedJobseeker && (
          <JobseekerDetail
            jobseeker={selectedJobseeker}
            onClose={() => this.onDetail()}
            buttons={[
              {
                label: 'Connect',
                color: 'green',
                onClick: () => this.onConnect(selectedJobseeker)
              },
              {
                label: 'Remove',
                color: 'yellow',
                onClick: () => this.onRemove(selectedJobseeker)
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
    jobseekers: state.rc_find.jobseekers,
    selectedJobseeker: state.rc_find.selectedJobseeker,
    errors: state.rc_find.errors
  }),
  {
    confirm,
    getJobseekers,
    selectJobseeker,
    connectJobseeker,
    removeJobseeker
  }
)(FindTalent);
