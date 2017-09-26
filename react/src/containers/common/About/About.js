import React, { Component } from 'react';
import Helmet from 'react-helmet';

export default class About extends Component {

  render() {
    return (
      <div className="container">

        <Helmet title="About" />

        <div className="pageHeader">
          <h3>About</h3>
        </div>

        <div className="board padding-45 markdown">
          <p>For too long hiring across the hospitality, retail and service industries has been beset with issues.
            Businesses become embroiled in time-consuming and often structure lacking recruitment processes – and
            must invest resources in interviews that, more often than not, lead to no job position offer whatsoever.</p>
          <p>MyJobPitch was established to overcome each and every last one of these problems.</p>
          <p>For recruiters, we offer access to thousands of job seekers who each provide information critical to
            your hiring decisions – read CVs and view candidates’ 30 second pitch videos. Just interview candidate
            that actually can get the Job.</p>
          <p>For job seekers, we provide a platform for connecting with the right recruiters spanning the hospitality,
            retail and the service industry. For discovering your next job role without the hassle and free from the
            need of registering with tens of differing websites and running around handing in CV every were.</p>
          <h4>This is the recruitment industry, revolutionised.</h4>
          <ul>
            <li>Easy-to-use, intuitive interface – for desktop and mobile</li>
            <li>30 Second job video pitches</li>
            <li>Connections made between employer and candidate –
              with details only released when both parties agree</li>
            <li>High quality employers, high calibre employees</li>
          </ul>
          <p><i>We’re eliminating efficiencies from the recruitment process for retail, hospitality and service
            businesses – doing away with the random and completely eradicating the unknown.</i></p>
          <div><i>For better job seeking. For better candidate hunting.</i></div>
        </div>

      </div>
    );
  }
}
