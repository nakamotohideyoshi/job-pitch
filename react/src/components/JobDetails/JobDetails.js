import React from 'react';
import { Row, Col, Tabs, Collapse, Tooltip } from 'antd';
import moment from 'moment';

import * as helper from 'utils/helper';

import { GoogleMap, Icons, VideoPlayer, SocialShare, Logo } from 'components';
import Wrapper from './JobDetails.styled';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

export default ({ jobData, application, className, roughLocation, actions }) => {
  const job = jobData || application.job_data;
  const logo = helper.getJobLogo(job);
  const workplace = job.location_data;
  const subName = helper.getFullBWName(job);
  const contract = helper.getNameByID('contracts', job.contract);
  const hours = helper.getNameByID('hours', job.hours);
  const marker = { lat: workplace.latitude, lng: workplace.longitude };
  const videos = job.videos.filter(({ video }) => video);
  const { interview, interviews } = application || {};

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
      <h2>Job Details</h2>

      <Row gutter={32}>
        <Col sm={24} md={10} lg={5}>
          <div className="logo">
            <Logo src={logo} size="100%" padding="10px" />
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
                    <Tooltip placement="bottom" title="Job Contract">
                      <Icons.HandshakeAlt />
                    </Tooltip>
                    {contract}
                  </li>
                  <li>
                    <Tooltip placement="bottom" title="Job Hours">
                      <Icons.Clock />
                    </Tooltip>
                    {hours}
                  </li>

                  {job.distance && (
                    <li>
                      <Tooltip placement="bottom" title="Distance">
                        <Icons.Route />
                      </Tooltip>
                      {job.distance}
                    </li>
                  )}

                  {interview && (
                    <li>
                      <Tooltip placement="bottom" title="Interview Date and Time">
                        <Icons.UserFriends />
                      </Tooltip>
                      {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
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

      <Tabs size="small" animated={false}>
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

        {interviews && (
          <TabPane tab="Interviews" key="3">
            <Collapse bordered={false}>
              {interviews.map(({ id, at, feedback }) => (
                <Panel key={id} showArrow={false} header={moment(at).format('ddd DD MMM, YYYY [at] H:mm')}>
                  <div>Feedback: {feedback}</div>
                </Panel>
              ))}
            </Collapse>
          </TabPane>
        )}
      </Tabs>
    </Wrapper>
  );
};
