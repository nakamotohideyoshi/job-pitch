import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { Container, AlertMsg } from 'components';

const NoPitch = ({ title, history }) => (
  <Container>
    <Helmet title={title} />

    <AlertMsg>
      <h2 style={{ marginBottom: '20px' }}>Your pitch video is missing!</h2>
      <span>
        {`Recruiters are looking for someone with your exact profile.
        You are the perfect candidate, let your personality shine and land you the job thet you really want!

        All you're missing is your video pitch!`}
      </span>
      <Link to="/jobseeker/settings/record">Record now!</Link>
    </AlertMsg>
  </Container>
);

export default NoPitch;
