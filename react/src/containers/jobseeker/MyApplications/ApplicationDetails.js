import React from 'react';
import { Row, Col, Tabs } from 'antd';

import * as helper from 'utils/helper';
import { GoogleMap, Icons, VideoPlayer, SocialShare, Logo } from 'components';
import Wrapper from './ApplicationDetails.styled';
import moment from 'moment';

const TabPane = Tabs.TabPane;

export default ({ job, className, roughLocation, actions, interview }) => {
  const logo = helper.getJobLogo(job);
  const workplace = job.location_data;
  const subName = helper.getFullBWName(job);
  const contract = helper.getNameByID('contracts', job.contract);
  const hours = helper.getNameByID('hours', job.hours);
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

  const videos = job.videos.filter(({ video }) => video);

  return (
    <Wrapper className={className}>
      <h2>Job Details</h2>

      <Row gutter={32}>
        <Col sm={24} md={10} lg={5}>
          <div className="logo">
            <Logo src={logo} size="100%" />
          </div>
        </Col>
        <Col sm={24} md={14} lg={19}>
          <Row gutter={32}>
            <Col md={24} lg={14}>
              <div className="info">
                <div className="name">{job.title}</div>
                <div className="sub-name">{subName}</div>
                <ul>
                  <li>
                    <Icons.HandshakeAlt />
                    {contract}
                  </li>
                  <li>
                    <Icons.Clock />
                    {hours}
                  </li>
                  {job.distance && (
                    <li>
                      <Icons.Route />
                      {job.distance}
                    </li>
                  )}
                  {interview && <li>{`Date: ${moment(interview.at).format('dddd, MMMM Do, YYYY h:mm:ss A')}`}</li>}
                  {interview &&
                    (interview.status === 'COMPLETED' || interview.status === 'CANCELLED') && (
                      <li>
                        <div>
                          {interview.feedback === '' ? (
                            <div>
                              Feedback:&nbsp;
                              <span style={{ color: 'grey', fontStyle: 'italic' }}>None</span>
                            </div>
                          ) : (
                            <div>
                              <span>Feedback: {interview.feedback}</span>
                            </div>
                          )}
                        </div>
                      </li>
                    )}
                </ul>
              </div>
            </Col>

            <Col md={24} lg={10}>
              <h3>Share Job</h3>
              <SocialShare className="social-icons" url={`${window.location.origin}/jobseeker/jobs/${job.id}`} />
              {actions}
            </Col>
          </Row>
        </Col>
      </Row>

      <Tabs size="small" type="card">
        <TabPane tab="Job Description" key="1">
          {videos.map(({ id, thumbnail, video }) => (
            <div key={id} className="pitch-video">
              <VideoPlayer
                controls
                poster={thumbnail}
                preload="none"
                sources={[
                  {
                    src: video,
                    type: 'video/mp4'
                  }
                ]}
              />
            </div>
          ))}
          <p className="description">{job.description}</p>
        </TabPane>

        <TabPane tab="Workplace Description" key="2">
          <div className="description">{workplace.description}</div>
          <div className="map">
            <div>
              <GoogleMap marker={marker} circle={circle} />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </Wrapper>
  );
};
