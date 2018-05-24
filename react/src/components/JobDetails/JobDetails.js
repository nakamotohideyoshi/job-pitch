import React from 'react';
import { Divider, Row, Col, Carousel } from 'antd';

import * as helper from 'utils/helper';
import { GoogleMap, Icons, VideoPlayer, SocialShare } from 'components';
import Wrapper from './JobDetails.styled';

export default class JobDetails extends React.Component {
  state = {
    show: false
  };

  playPitch = show => this.setState({ show });

  render() {
    const { job, className, roughLocation, actions } = this.props;
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

        <Divider />

        <h3>Job Description</h3>

        {videos && (
          <Carousel infinite={false} draggable>
            {videos.map(({ thumbnail, video }) => (
              <div className="job-resource">
                <span style={{ backgroundImage: `url(${thumbnail})` }}>
                  <Icons.PlayCircle />
                </span>
              </div>
            ))}
          </Carousel>
        )}

        <div className="description">{job.description}</div>

        <Divider />

        <h3>Workplace Description</h3>

        <div className="description">{workplace.description}</div>

        <div className="map">
          <div>
            <GoogleMap marker={marker} circle={circle} />
          </div>
        </div>

        {/* {this.state.show && <VideoPlayer videoUrl={pitch.video} onClose={() => this.playPitch()} />} */}
      </Wrapper>
    );
  }
}
