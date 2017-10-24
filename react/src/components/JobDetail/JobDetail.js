import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { Map, LogoImage } from 'components';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './JobDetail.scss';

export default class JobDetail extends Component {
  static propTypes = {
    job: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    button1: PropTypes.object,
    button2: PropTypes.object,
  }

  static defaultProps = {
    button1: null,
    button2: null,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  onClose = callback => {
    callback();
    this.props.onClose();
  }

  render() {
    const { job, button1, button2, onClose } = this.props;
    const image = utils.getJobLogo(job);
    const workplace = job.location_data;
    const jobFullName = utils.getJobFullName(job);
    const markerPos = { lat: workplace.latitude, lng: workplace.longitude };

    const hours = this.api.hours.filter(item => item.id === job.hours)[0];
    const contract = this.api.contracts.filter(item => item.id === job.contract)[0];
    const isPermanent = this.api.contracts.filter(item => item.id === contract.id && item.name === 'Permanent')[0];
    let attributes = hours.name;
    if (isPermanent) {
      attributes = `${attributes} (${contract.name})`;
    }

    return (
      <Modal show onHide={onClose} bsStyle="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Detail</Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.body}>

          <div className="board padding-30">
            <div className={styles.info}>
              <LogoImage image={image} size={100} />
              <div className={styles.content}>
                <div className={styles.title}>
                  <h4>{job.title}</h4>
                  <div className={styles.distance}>{job.distance}</div>
                </div>
                <div className={styles.businessName}>{jobFullName}</div>
                <div className={styles.attributes}>{attributes}</div>
              </div>
            </div>

            <hr />

            <div className={styles.overview}>
              <h4>Job Description</h4>
              <div className="description">{job.description}</div>
            </div>

          </div>

          <div className="board padding-30">
            <div className={styles.overview}>
              <h4>Workplace Description</h4>
              <div className="description">{workplace.description}</div>
            </div>
            <div style={{ height: '300px' }}>
              <Map
                defaultCenter={markerPos}
                marker={markerPos}
                options={{ scrollwheel: false }}
              />
            </div>
          </div>

        </Modal.Body>

        <Modal.Footer className={styles.footer}>
          {
            button1 &&
            <Button
              type="button"
              bsStyle="success"
              onClick={() => this.onClose(button1.callback)}
            >{button1.label}</Button>
          }
          {
            button2 &&
            <Button
              type="button"
              onClick={() => this.onClose(button2.callback)}
            >{button2.label}</Button>
          }
          <Button
            type="button"
            onClick={onClose}
          >Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
