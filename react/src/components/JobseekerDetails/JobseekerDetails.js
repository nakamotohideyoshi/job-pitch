import React from 'react';
import { Row, Col, Button, Tabs, Collapse } from 'antd';
import moment from 'moment';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { Icons, VideoPlayer, Logo } from 'components';
import Wrapper from './JobseekerDetails.styled';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

export default ({ jobseeker, application, className, actions }) => {
  const js = jobseeker || application.job_seeker;
  const image = helper.getPitch(js).thumbnail;
  const fullName = helper.getFullJSName(js);
  const age = js.age_public && js.age;
  const sex = js.sex_public && helper.getNameByID('sexes', js.sex);

  let email, mobile;
  if (application) {
    email = js.email_public && js.email;
    mobile = js.mobile_public && js.mobile;
  }

  const pitches = js.pitches.filter(({ video }) => video);

  return (
    <Wrapper className={className}>
      <h2>Jobseeker Details</h2>

      <Row gutter={32}>
        <Col sm={24} md={10} lg={5}>
          <div className="logo">
            <Logo src={image} size="100%" />
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

      {js.has_national_insurance_number && (
        <div className="check-label">
          <Icons.CheckSquare size="lg" />
          National Insurance number supplied
        </div>
      )}
      {js.has_references && (
        <div className="check-label">
          <Icons.CheckSquare size="lg" />
          Reference available on request
        </div>
      )}
      {js.truth_confirmation && (
        <div className="check-label">
          <Icons.CheckSquare size="lg" />
          By ticking this box I confirm that all information given is true, I understand that any falsification may lead
          to dismissal, and that I am entitled to work. If required by employer I will give full details if I have been
          convicted of any criminal offence.
        </div>
      )}

      <Tabs size="small" animated={false}>
        <TabPane tab="Overview" key="1">
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
          <p className="description">{js.description}</p>

          {js.cv && (
            <Button className="btn-cv" style={{ marginTop: '20px' }} onClick={() => window.open(js.cv)}>
              CV View
            </Button>
          )}
        </TabPane>

        {application &&
          application.status !== DATA.APP.CREATED && (
            <TabPane tab="Interviews" key="2">
              <Collapse bordered={false}>
                {application.interviews.map(({ id, at, feedback }) => (
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
