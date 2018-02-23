import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';

import * as helper from 'utils/helper';
import { getJobseeker } from 'redux/recruiter/jobseeker';

import { Loading, FlexBox } from 'components';

class JobseekerDetail extends React.Component {
  componentWillMount() {
    this.jobId = helper.str2int(this.props.match.params.jobId);
    this.jobseekerId = helper.str2int(this.props.match.params.jobseekerId);
    if (this.jobId || this.jobseekerId) {
      this.props.getJobseeker(this.jobId, this.jobseekerId);
    } else {
    }
  }

  render() {
    return (
      <Fragment>
        <Container>
          <FlexBox center>
            <Loading />
          </FlexBox>
        </Container>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.rc_jobseeker.jobseeker,
    application: state.rc_jobseeker.application,
    errors: state.rc_jobseeker.errors
  }),
  {
    getJobseeker
  }
)(JobseekerDetail);
