import React from 'react';
import { Divider, Row, Col, Button } from 'antd';

import * as helper from 'utils/helper';

import { Icons, VideoPlayer } from 'components';
import Wrapper from './JobseekerDetails.styled';

export default ({ jobseeker, connected, className, actions }) => {
  const image = helper.getPitch(jobseeker).thumbnail;
  const fullName = helper.getFullJSName(jobseeker);
  const age = jobseeker.age_public && jobseeker.age;
  const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);

  let email, mobile;
  if (connected) {
    email = jobseeker.email_public && jobseeker.email;
    mobile = jobseeker.mobile_public && jobseeker.mobile;
  }

  const pitches = jobseeker.pitches.filter(({ video }) => video);

  return (
    <Wrapper className={className}>
      <Row gutter={32}>
        <Col sm={24} md={10} lg={5}>
          <div className="avatar">
            <span style={{ backgroundImage: `url(${image})` }} />
          </div>
        </Col>
        <Col sm={24} md={14} lg={19}>
          <Row gutter={32}>
            <Col md={24} lg={14}>
              <div className="info">
                <div className="name">{fullName}</div>
                <ul>
                  {age && (
                    <li>
                      <label>Age:</label> {age}
                    </li>
                  )}
                  {sex && (
                    <li>
                      <label>Sex:</label> {sex}
                    </li>
                  )}
                  {email && (
                    <li>
                      <label>Email:</label> {email}
                    </li>
                  )}
                  {mobile && (
                    <li>
                      <label>Mobile:</label> {mobile}
                    </li>
                  )}
                </ul>
              </div>
            </Col>
            <Col md={24} lg={10}>
              {actions}
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider />

      <div>
        <h3>Overview</h3>
        {pitches.map(({ id, thumbnail, video }) => (
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
        <p className="description">{jobseeker.description}</p>
      </div>

      <div style={{ clear: 'both' }} />

      {jobseeker.cv && (
        <Button className="btn-cv" onClick={() => window.open(this.props.jobseeker.cv)}>
          CV View
        </Button>
      )}

      {jobseeker.has_national_insurance_number && (
        <div className="check-label">
          <Icons.CheckSquare size="lg" />
          National Insurance number supplied
        </div>
      )}
      {jobseeker.has_references && (
        <div className="check-label">
          <Icons.CheckSquare size="lg" />
          Reference available on request
        </div>
      )}
      {jobseeker.truth_confirmation && (
        <div className="check-label">
          <Icons.CheckSquare size="lg" />
          I confirm that all information provided is truthful and confirm I have the legal right to work
        </div>
      )}
    </Wrapper>
  );
};
