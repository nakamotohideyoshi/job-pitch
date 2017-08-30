import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default class How1 extends Component {

  render() {
    return (
      <div className="container help">
        <Helmet title="Recruiter" />
        <h1>Recruiter</h1>
        <p><b>Discover the new age of recruitment – and explore superior calibre candidates at the tap of
        a few buttons</b></p>
        <p><i>Register</i></p>
        <p>Quickly and easily set up your profile – from desktop or mobile. No long forms, no complex processes.</p>
        <p><i>Post Your Job</i></p>
        <p>Post your job, painlessly - pause it once you’ve discovered your next employee, and un-pause it as soon as
        another position pops up, just edit if you need to.</p>
        <p><i>Recruit</i></p>
        <p>Browse through high calibre candidates – view pitch videos, explore key information that’s relevant to
        your criteria, read CVs and decide whether to interview or hire on sight.</p>
        <p><b>Recruitment. Simplified.</b></p>
        <p>Forget about posting multiple Gumtree ads, spending time organising numerous profiles and piles of
        paperwork – this is the single online destination for recruiting in the hospitality,
        retail and services industries.</p>
        <p><b>Pay only when your discover your next hire</b></p>
        <p>Transparency and fairness – we believe that they’re both vitally important in our line of business.
        Which is why you only pay when you discover a jobseeker who you wish to connect to.</p>
      </div>
    );
  }
}
