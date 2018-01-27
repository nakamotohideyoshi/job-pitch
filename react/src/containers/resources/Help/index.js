import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';

import { Board } from 'components';
import Wrapper from './Wrapper';

const RecruiterHelp = () => (
  <Board>
    <h1>Discover the new age of recruitment – and explore superior calibre candidates at the tap of a few buttons</h1>
    <p>
      <i>Register</i>
    </p>
    <p>Quickly and easily set up your profile – from desktop or mobile. No long forms, no complex processes.</p>
    <p>
      <i>Post Your Job</i>
    </p>
    <p>
      Post your job, painlessly - pause it once you’ve discovered your next employee, and un-pause it as soon as another
      position pops up, just edit if you need to.
    </p>
    <p>
      <i>Recruit</i>
    </p>
    <p>
      Browse through high calibre candidates – view pitch videos, explore key information that’s relevant to your
      criteria, read CVs and decide whether to interview or hire on sight.
    </p>
    <h2>Recruitment. Simplified.</h2>
    <p>
      Forget about posting multiple Gumtree ads, spending time organising numerous profiles and piles of paperwork –
      this is the single online destination for recruiting in the hospitality, retail and services industries.
    </p>
    <h2>Pay only when your discover your next hire</h2>
    <div>
      Transparency and fairness – we believe that they’re both vitally important in our line of business. Which is why
      you only pay when you discover a jobseeker who you wish to connect to.
    </div>
  </Board>
);

const JobseekerHelp = () => (
  <Board>
    <h1>Welcome to your next job role – here’s where you meet the perfect employer</h1>
    <p>
      <i>Register</i>
    </p>
    <p>
      Create your profile - upload your CV, write a short CV overview with key skills and other information that
      portrays you as the illustrious candidate you are.
    </p>
    <p>
      <i>Record Your Pitch</i>
    </p>
    <p>
      Use your smartphone or web cam to create a up to 30 second candidate pitch video – show and tell our employees
      exactly why you should be their next hire.
    </p>
    <p>
      <i>Get Hired</i>
    </p>
    <p>
      Then sit back and relax as employers contact you to invite you to an interview, or hire you right there, and right
      then. What could be simpler?
    </p>
    <h2>Seek and discover your hospitality, retail or services position</h2>
    <div>
      As a worker in any of these industries, you often face tens of differing websites when it comes to discovering
      your next position. With MyJobPitch, that search stops here. Recruiters come to us as we provide real insight into
      potential candidates – for which your pitch will prove pivotal to securing your next position – so take charge and
      make it count!
    </div>
  </Board>
);

const Help = ({ loginState }) => (
  <Wrapper>
    <Helmet title="How it works" />

    <Container>
      {loginState !== 'jobseeker' && <RecruiterHelp />}
      {loginState !== 'recruiter' && <JobseekerHelp />}
    </Container>
  </Wrapper>
);

export default connect(
  state => ({
    loginState: state.auth.loginState
  }),
  {}
)(Help);
