import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Row, Col, Tabs, Collapse, Tooltip } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { GoogleMap, Icons, VideoPlayer, ShareMenu, Logo } from 'components';
import Wrapper from './JobDetails.styled';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const JobDetails = ({ jobData, application, className, roughLocation, actions, defaultTab }) => {
  const job = jobData || application.job_data;
  const logo = helper.getJobLogo(job);
  const workplace = job.location_data;
  const subName = helper.getJobSubName(job);
  const sector = helper.getNameByID(DATA.sectors, job.sector);
  const contract = helper.getNameByID(DATA.contracts, job.contract);
  const hours = helper.getNameByID(DATA.hours, job.hours);
  const marker = { lat: workplace.latitude, lng: workplace.longitude };
  const videos = job.videos.filter(({ video }) => video);
  const { interview, interviews } = application || {};
  const { id: interviewId } = interview || {};
  const histories = interviews && interviews.filter(({ id }) => id !== interviewId);

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
        strokeColor: colors.green,
        strokeWeight: 2
      }
    };
  }

  return (
    <Wrapper className={className}>
      <h2>Job Details</h2>

      <Row gutter={32}>
        <Col xs={10} sm={8} md={6} lg={5}>
          <div className="logo">
            <Logo src={logo} size="100%" padding="10px" />
          </div>
        </Col>
        <Col xs={14} sm={16} md={18} lg={19}>
          <Row gutter={32}>
            <Col md={14} lg={15}>
              <div className="info">
                <div className="name">{job.title}</div>
                <div className="sub-name1">( {subName} )</div>
                <div className="sub-name2">{sector}</div>
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
                    <li className={interview.status}>
                      <Tooltip placement="bottom" title="Interview Date and Time">
                        <Icons.UserClock />
                      </Tooltip>
                      {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
                    </li>
                  )}
                </ul>
              </div>
            </Col>

            <Col md={10} lg={9}>
              <h3>Share Job</h3>
              <ShareMenu className="social-icons" url={`${window.location.origin}/jobseeker/jobs/${job.id}`} />
              {actions}
            </Col>
          </Row>
        </Col>
      </Row>

      <Tabs size="small" animated={false} defaultActiveKey={defaultTab || 'job'}>
        <TabPane tab="Job Description" key="job">
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

        <TabPane tab="Workplace Description" key="workplace">
          <div className="description">{workplace.description}</div>
          <div className="map">
            <div>
              <GoogleMap marker={marker} circle={circle} />
            </div>
          </div>
        </TabPane>

        {histories && (
          <TabPane tab="Previous interviews" key="history">
            <Collapse bordered={false}>
              {histories.map(({ id, at, feedback, status, cancelled_by }) => {
                let statusComment;
                let statusLabel;
                if (status === 'COMPLETED') {
                  statusLabel = 'Completed';
                  statusComment = 'This interview is done';
                } else if (status === 'CANCELLED') {
                  statusLabel = 'Cancelled';
                  statusComment = `Interview cancelled by ${
                    cancelled_by === DATA.userRole ? 'Recruiter' : 'Jobseeker'
                  }`;
                }
                return (
                  <Panel
                    key={id}
                    showArrow={false}
                    header={
                      <div>
                        <span>{moment(at).format('ddd DD MMM, YYYY [at] H:mm')}</span>
                        <span className={status}>{statusLabel}</span>
                      </div>
                    }
                  >
                    <p>Status: {statusComment}</p>
                    {status === 'COMPLETED' && (
                      <p>Feedback: {feedback ? feedback : <span style={{ fontStyle: 'italic' }}>None</span>}</p>
                    )}
                  </Panel>
                );
              })}
            </Collapse>
          </TabPane>
        )}
      </Tabs>
    </Wrapper>
  );
};

JobDetails.propTypes = {
  jobData: PropTypes.object,
  application: PropTypes.object,
  className: PropTypes.string,
  roughLocation: PropTypes.any, // PropTypes.bool
  actions: PropTypes.node,
  defaultTab: PropTypes.string
};

JobDetails.defaultProps = {
  jobData: null,
  application: null,
  className: null,
  roughLocation: false,
  actions: null,
  defaultTab: null
};

export default JobDetails;
