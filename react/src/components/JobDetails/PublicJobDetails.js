import React from 'react';
import { Divider, Row, Col } from 'antd';

import * as helper from 'utils/helper';
import { GoogleMap, Icons, VideoPlayer, SocialShare } from 'components';
import Wrapper from './JobDetails.styled';

export default ({ job, className, roughLocation, actions }) => {
  const logo = helper.getJobLogo(job);
  const workplace = job.location;
  const title = job.title;
  const marker = { lat: workplace.latitude, lng: workplace.longitude };

  let circle;
  if (roughLocation) {
    const alpha = 2 * Math.PI * Math.random();
    const rand = Math.random();
    marker.lat += 0.00434195349206 * Math.cos(alpha) * rand;
    marker.lng += 0.00528038212262 * Math.sin(alpha) * rand;
    circle = {
      center: marker,
      radius: 482.8,
      options: {
        fillColor: '#ff930080',
        strokeColor: '#00b6a4',
        strokeWeight: 2
      }
    };
  }

  return (
    <Wrapper className={className}>
      <Row gutter={32}>
        <Col sm={24} md={10} lg={5}>
          <div className="logo">
            <span style={{ backgroundImage: `url(${logo})` }} />
          </div>
        </Col>
        <Col sm={24} md={14} lg={19}>
          <Row gutter={32}>
            <Col md={24} lg={14}>
              <div className="info">
                <div className="name">{title}</div>
              </div>
            </Col>
            <Col md={24} lg={10}>
              <h3>Login or Register to Apply</h3>
              {actions}
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <div>
        <h3>Job Description</h3>
        <p className="description">{job.description}</p>
      </div>
      <Divider />
      <div className="map">
        <div>
          <GoogleMap marker={marker} circle={circle} />
        </div>
      </div>
    </Wrapper>
  );
};
