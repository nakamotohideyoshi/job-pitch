import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import * as helper from 'utils/helper';
import { Board, Logo, GoogleMap } from 'components';
import Wrapper from './Wrapper';

export default class JobDetail extends React.PureComponent {
  onClose = onClick => {
    onClick();
    this.props.onClose();
  };

  render() {
    const { job, buttons, onClose } = this.props;
    const logo = helper.getJobLogo(job);
    const workplace = job.location_data;
    const bwName = helper.getFullBWName(job);
    const marker = { lat: workplace.latitude, lng: workplace.longitude };
    const contract = helper.getNameByID('contracts', job.contract);
    const hours = helper.getNameByID('hours', job.hours);

    return (
      <Wrapper isOpen toggle={onClose} size="lg">
        <ModalHeader toggle={onClose}>Job Detail</ModalHeader>

        <ModalBody>
          <Board block className="main-board">
            <div className="info">
              <Logo src={logo} circle size="100" />

              <div className="content">
                <div className="name">
                  <h4>{job.title}</h4>
                  <div className="distance">{job.distance}</div>
                </div>
                <div className="businessName">{bwName}</div>
                <div className="attributes">
                  <span>
                    <label>hours:</label> {hours}
                  </span>
                  {contract === 'Permanent' && (
                    <span>
                      <label>contract:</label> {contract}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <hr />

            <div className="overview">
              <h4>Job Description</h4>
              <div>{job.description}</div>
            </div>
          </Board>

          <Board block className="workplace-board">
            <div className="overview">
              <h4>Workplace Description</h4>
              <div>{workplace.description}</div>
            </div>

            <div className="map">
              <div>
                <GoogleMap defaultCenter={marker} markers={[marker]} options={{ scrollwheel: false }} />
              </div>
            </div>
          </Board>
        </ModalBody>

        <ModalFooter>
          <div>
            {buttons &&
              buttons.map((button, index) => (
                <Button
                  key={index}
                  color={button.color}
                  outline={button.outline}
                  onClick={() => this.onClose(button.onClick)}
                >
                  {button.label}
                </Button>
              ))}
          </div>

          <Button color="gray" outline onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Wrapper>
    );
  }
}
