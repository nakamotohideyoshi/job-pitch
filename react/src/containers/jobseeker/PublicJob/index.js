import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Row, Col, Button, Tooltip, Tabs } from 'antd';

import { getPublicJob } from 'redux/jobseeker/find';
import * as helper from 'utils/helper';

import { Loading, Logo, AlertMsg, Icons, VideoPlayer, GoogleMap } from 'components';
import Wrapper from './styled';

const TabPane = Tabs.TabPane;

class PublicJob extends React.Component {
  componentWillMount() {
    let jobId = helper.str2int(this.props.match.params.jobId);
    this.props.getPublicJob(jobId);
  }

  onLogin = () => {
    this.props.history.push(`/auth?redirect=${this.props.location.pathname}`);
  };

  onRegister = () => {
    this.props.history.push(`/auth/register`);
  };

  render() {
    const { job, error } = this.props;

    if (error) {
      return (
        <AlertMsg>
          <span>Server Error!</span>
        </AlertMsg>
      );
    }

    if (!job) {
      return <Loading size="large" />;
    }

    const logo = helper.getJobLogo(job);
    const sector = job.sector.name;
    const contract = job.contract.name;
    const hours = job.hours.name;
    const workplace = job.location_data;
    const marker = { lat: workplace.latitude, lng: workplace.longitude };
    const videos = job.videos.filter(({ video }) => video);

    const alpha = 2 * Math.PI * Math.random();
    const rand = Math.random();
    marker.lat += 0.00434195349206 * Math.cos(alpha) * rand;
    marker.lng += 0.00528038212262 * Math.sin(alpha) * rand;
    const circle = {
      center: marker,
      radius: 482.8,
      options: {
        fillColor: '#ff930080',
        strokeColor: '#00b6a4',
        strokeWeight: 2
      }
    };

    return (
      <Wrapper className="container">
        <Helmet title="Job Details" />

        <div className="content">
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
                    <div className="sub-name">{sector}</div>
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
                    </ul>
                  </div>
                </Col>

                <Col md={10} lg={9}>
                  <h3>Login or Register to Apply</h3>
                  <Button type="primary" onClick={this.onLogin}>
                    Sign in
                  </Button>
                  <Button type="primary" onClick={this.onRegister}>
                    Register
                  </Button>
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
          </Tabs>
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    job: state.js_find.publicJob,
    error: state.js_find.error
  }),
  {
    getPublicJob
  }
)(PublicJob);
