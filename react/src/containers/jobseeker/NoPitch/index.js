import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import Wrapper from './Wrapper';

const NoPitch = ({ history }) => (
  <Wrapper>
    <h2>Your pitch video is missing!</h2>
    <div>
      {`Recruiters are looking for someone with your exact profile.
        You are the perfect candidate, let your personality shine and land you the job thet you really want!

        All you're missing is your video pitch!`}
    </div>
    <Link to="/jobseeker/record">Record now!</Link>
  </Wrapper>
);

export default withRouter(NoPitch);
