import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default class How extends Component {
  render() {
    return (
      <div>
        <Helmet title="How it works" />
        <div className="pageHeader">
          <h1>How it works</h1>
        </div>
        <div className="board">
          <p><b>Welcome to your next job role – here’s where you meet the perfect employer</b></p>
          <p><i>Register</i></p>
          <p>Create your profile - upload your CV, write a short CV overview with key skills and
          other information that portrays you as the illustrious candidate you are.</p>
          <p><i>Record Your Pitch</i></p>
          <p>Use your smartphone or web cam to create a up to 30 second candidate pitch video –
          show and tell our employees exactly why you should be their next hire.</p>
          <p><i>Get Hired</i></p>
          <p>Then sit back and relax as employers contact you to invite you to an interview, or
          hire you right there, and right then. What could be simpler?</p>
          <p><b>Seek and discover your hospitality, retail or services position</b></p>
          <p>As a worker in any of these industries, you often face tens of differing websites when
          it comes to discovering your next position. With MyJobPitch, that search stops here.
          Recruiters come to us as we provide real insight into potential candidates – for which
          your pitch will prove pivotal to securing your next position – so take charge and make it count!</p>
        </div>
      </div>
    );
  }
}
