import React from 'react';
import { Row, Col, Button, Tabs, Collapse } from 'antd';
import moment from 'moment';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { Icons, VideoPlayer, Logo } from 'components';
import Interview from './Interview';
import Wrapper from './JobseekerDetails.styled';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

export default ({ jobseekerData, application, actions, defaultTab }) => {
  const jobseeker = jobseekerData || application.job_seeker;
  const avatar = helper.getAvatar(jobseeker);
  const fullName = helper.getFullJSName(jobseeker);
  const age = jobseeker.age_public && jobseeker.age;
  const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);
  const pitches = jobseeker.pitches.filter(({ video }) => video);
  let email, mobile;
  if (application) {
    email = jobseeker.email_public && jobseeker.email;
    mobile = jobseeker.mobile_public && jobseeker.mobile;
  }

  const { status, interview, interviews } = application || {};
  const connected = application && status !== DATA.APP.CREATED;
  const { id: interviewId, status: interviewStatus } = interview || {};
  const histories = interviews && interviews.filter(({ id }) => id !== interviewId);

  return (
    <Wrapper>
      <h2>Jobseeker Details</h2>

      <Row gutter={32}>
        <Col xs={10} sm={8} md={6} lg={5}>
          <div className="logo">
            <Logo src={avatar} size="100%" />
          </div>
        </Col>
        <Col xs={14} sm={16} md={18} lg={19}>
          <Row gutter={32}>
            <Col md={14} lg={15}>
              <div className="info">
                <div className="name">{fullName}</div>
                <ul>
                  {!!age && (
                    <li>
                      <strong>Age:</strong> {age}
                    </li>
                  )}
                  {sex && (
                    <li>
                      <strong>Sex:</strong> {sex}
                    </li>
                  )}
                  {email && (
                    <li>
                      <strong>Email:</strong> {email}
                    </li>
                  )}
                  {mobile && (
                    <li>
                      <strong>Mobile:</strong> {mobile}
                    </li>
                  )}
                  {interview && (
                    <li className={interviewStatus}>
                      <strong>Interview:</strong> {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
                    </li>
                  )}
                </ul>
              </div>
            </Col>
            <Col md={10} lg={9} className="controls">
              {actions}
            </Col>
          </Row>
        </Col>
      </Row>

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
          By ticking this box I confirm that all information given is true, I understand that any falsification may lead
          to dismissal, and that I am entitled to work. If required by employer I will give full details if I have been
          convicted of any criminal offence.
        </div>
      )}

      <Tabs size="small" animated={false} defaultActiveKey={defaultTab || 'overview'}>
        <TabPane tab="Overview" key="overview">
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

          {jobseeker.cv && (
            <Button className="btn-cv" style={{ marginTop: '20px' }} onClick={() => window.open(jobseeker.cv)}>
              CV View
            </Button>
          )}
        </TabPane>

        {connected && (
          <TabPane tab="Interview" key="interview">
            <Interview application={application} />
          </TabPane>
        )}

        {connected && (
          <TabPane tab="Previous interviews" key="history">
            <Collapse bordered={false}>
              {histories.map(({ id, at, feedback, status, notes, cancelled_by }) => {
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
                    <p>Recruiter's notes: {notes}</p>
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
