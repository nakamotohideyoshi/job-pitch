import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { PageHeader } from 'components';

import { selectUserType } from 'redux/auth';
import Container from './Wrapper';

class SelectType extends React.PureComponent {
  render() {
    const { selectUserType } = this.props;

    return (
      <Fragment>
        <Helmet title="Select Type" />

        <Container>
          <PageHeader>Select Type</PageHeader>
          <div className="content">
            <Button color="green" size="lg" onClick={() => selectUserType('recruiter')}>
              I'm a Recruiter
            </Button>

            <Button color="yellow" size="lg" onClick={() => selectUserType('jobseeker')}>
              I'm a JobSeeker
            </Button>
          </div>
        </Container>
      </Fragment>
    );
  }
}

export default connect(state => ({}), { selectUserType })(SelectType);
