import React from 'react';
import Helmet from 'react-helmet';
import { Container } from 'reactstrap';

import { GoogleMap } from 'components';
import { Board } from 'components';
import Wrapper from './Wrapper';

const position = {
  lat: 51.5139057,
  lng: -0.1250237
};

export default () => (
  <Wrapper>
    <Helmet title="Contact Us" />

    <Container>
      <Board>
        <h1>Contact Us</h1>

        <div className="content">
          <div className="map">
            <GoogleMap markers={[position]} defaultCenter={position} />
          </div>

          <div>
            <h5>{'Email: '}</h5>
            <p>
              <a href="mailto:support@myjobpitch.com">support@myjobpitch.com</a>
            </p>
            <h5>Mail Address:</h5>
            <p>71-75 Shelton Street Covent Garden London WC2H 9JQ</p>
          </div>
        </div>
      </Board>
    </Container>
  </Wrapper>
);
