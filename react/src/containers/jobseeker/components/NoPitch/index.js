import React from 'react';
import Helmet from 'react-helmet';
import { withRouter, Link } from 'react-router-dom';
import { AlertMsg } from 'components';

class NoPitch extends React.Component {
  render() {
    const { title, location } = this.props;
    return (
      <AlertMsg>
        <Helmet title={title} />

        <h2>Your pitch video is missing!</h2>
        <span>
          {`Recruiters are looking for someone with your exact profile.
            You are the perfect candidate, let your personality shine and land you the job thet you really want!

            All you're missing is your video pitch!`}
        </span>
        <Link
          to={{
            pathname: '/jobseeker/settings/record',
            state: { from: location.pathname }
          }}
        >
          Record now!
        </Link>
      </AlertMsg>
    );
  }
}

export default withRouter(NoPitch);
