import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { Map } from 'components';
import * as utils from 'helpers/utils';
import styles from './JobDetail.scss';

@connect(
  (state) => ({
    staticData: state.auth.staticData,
  }),
  { }
)
export default class JobDetail extends Component {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    job: PropTypes.object.isRequired,
    resolveName: PropTypes.string,
    onResolve: PropTypes.func,
    rejectName: PropTypes.string,
    onReject: PropTypes.func,
    onClose: PropTypes.func.isRequired,
  }

  static defaultProps = {
    resolveName: '',
    onResolve: null,
    rejectName: '',
    onReject: null,
  }

  render() {
    const { staticData, job, resolveName, onResolve, rejectName, onReject, onClose } = this.props;
    const logo = utils.getJobLogo(job, true);
    const workplace = job.location_data;
    const jobFullName = utils.getJobFullName(job);
    const markerPos = { lat: workplace.latitude, lng: workplace.longitude };

    const hours = staticData.hours.filter(item => item.id === job.hours)[0];
    const contract = staticData.contracts.filter(item => item.id === job.contract)[0];
    const isPermanent = staticData.contracts.filter(item => item.id === contract.id && item.name === 'Permanent')[0];
    let attributes = hours.name;
    if (isPermanent) {
      attributes = `${attributes} (${contract.name})`;
    }

    return (
      <Modal show onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Job Detail</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={styles.topContainer}>
            <img src={logo} alt="" />
            <div className={styles.right} >
              <div className={styles.title}>
                <h4>{job.title}</h4>
                <div className={styles.distance}>{job.distance}</div>
              </div>
              <div className={styles.businessName}>{jobFullName}</div>
              <div className={styles.attributes}>{attributes}</div>
            </div>
          </div>
          <div>
            <h4>Job Description</h4>
            <div className={styles.description}>{job.description}</div>
          </div>
          <div>
            <h4>Workplace Description</h4>
            <div className={styles.description}>{workplace.description}</div>
            <div className={styles.mapContainer}>
              <Map
                defaultCenter={markerPos}
                marker={markerPos}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            onClick={onClose}
          >Close</Button>
          {
            onReject && (
              <Button
                type="button"
                onClick={() => onReject()}
              >{rejectName}</Button>
            )
          }
          {
            onResolve && (
              <Button
                type="button"
                bsStyle="success"
                onClick={() => onResolve()}
              >{resolveName}</Button>
            )
          }
        </Modal.Footer>
      </Modal>
    );
  }
}
