import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';

import * as helper from 'utils/helper';

import { Loading, FlexBox } from 'components';

import { getJob } from 'redux/jobseeker/job';

class JobDetail extends React.Component {
  componentDidMount() {
    const jobId = helper.str2int(this.props.match.params.jobId);
    if (jobId) {
      this.props.getJob(jobId);
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

export default connect(state => ({}), {
  getJob
})(JobDetail);
