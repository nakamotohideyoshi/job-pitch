import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import styles from './Help.scss';

export default class Help extends Component {

  constructor(props) {
    super(props);
    this.state = {
      type: 1
    };
  }

  onRecruiter = () => this.setState({ type: 1 });
  onJobSeeker = () => this.setState({ type: 2 });

  render() {
    const isRecruiter = this.state.type === 1;

    return (
      <div className="container">
        <Helmet title="How it works" />

        <div className="pageHeader">
          <h3>How it works</h3>
        </div>

        <div className="board padding-45 markdown">

          <div className={styles.tab}>
            <Link
              className={isRecruiter ? styles.active : ''}
              onClick={this.onRecruiter}
            ><h5>Recruiter</h5></Link>
            <Link
              className={!isRecruiter ? styles.active : ''}
              onClick={this.onJobSeeker}
            ><h5>Job Seeker</h5></Link>
          </div>

          {
            isRecruiter ?
              <div>
                <h4>Discover the new age of recruitment – and explore superior calibre candidates at the tap of
                  a few buttons</h4>
                <p><i>Register</i></p>
                <p>Quickly and easily set up your profile – from desktop or mobile. No long forms, no complex
                  processes.</p>
                <p><i>Post Your Job</i></p>
                <p>Post your job, painlessly - pause it once you’ve discovered your next employee, and un-pause it
                  as soon as another position pops up, just edit if you need to.</p>
                <p><i>Recruit</i></p>
                <p>Browse through high calibre candidates – view pitch videos, explore key information that’s
                  relevant to your criteria, read CVs and decide whether to interview or hire on sight.</p>
                <h4>Recruitment. Simplified.</h4>
                <p>Forget about posting multiple Gumtree ads, spending time organising numerous profiles and piles of
                  paperwork – this is the single online destination for recruiting in the hospitality,
                  retail and services industries.</p>
                <h4>Pay only when your discover your next hire</h4>
                <div>Transparency and fairness – we believe that they’re both vitally important in our line of business.
                  Which is why you only pay when you discover a jobseeker who you wish to connect to.</div>
              </div> :
              <div>
                <h4>Welcome to your next job role – here’s where you meet the perfect employer</h4>
                <p><i>Register</i></p>
                <p>Create your profile - upload your CV, write a short CV overview with key skills and
                  other information that portrays you as the illustrious candidate you are.</p>
                <p><i>Record Your Pitch</i></p>
                <p>Use your smartphone or web cam to create a up to 30 second candidate pitch video –
                  show and tell our employees exactly why you should be their next hire.</p>
                <p><i>Get Hired</i></p>
                <p>Then sit back and relax as employers contact you to invite you to an interview, or
                  hire you right there, and right then. What could be simpler?</p>
                <h4>Seek and discover your hospitality, retail or services position</h4>
                <div>As a worker in any of these industries, you often face tens of differing websites when
                  it comes to discovering your next position. With MyJobPitch, that search stops here.
                  Recruiters come to us as we provide real insight into potential candidates – for which
                  your pitch will prove pivotal to securing your next position – so take charge and make it count!</div>
              </div>
          }

        </div>

      </div>
    );
  }
}
