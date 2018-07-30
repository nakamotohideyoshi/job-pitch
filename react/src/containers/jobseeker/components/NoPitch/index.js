import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertMsg } from 'components';

export default ({ title, backUrl }) => (
  <AlertMsg>
    <Helmet title={title} />

    <h2>Your pitch video is missing!</h2>
    <span>
      {`Recruiters are looking for someone with your exact profile.
        You are the perfect candidate, let your personality shine and land you the job thet you really want!

        All you're missing is your video pitch!`}
    </span>
    <Link to="/jobseeker/settings/record" onClick={() => localStorage.setItem('back', backUrl)}>
      Record now!
    </Link>
  </AlertMsg>
);
