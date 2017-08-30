import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Button from 'react-bootstrap/lib/Button';
import * as utils from 'helpers/utils';
import styles from './JobSeekerDetail.scss';

@connect(
  (state) => ({
    staticData: state.auth.staticData,
  }),
  { }
)
export default class JobSeekerDetail extends Component {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    application: PropTypes.object,
    jobSeeker: PropTypes.object.isRequired,
    resolveName: PropTypes.string,
    onResolve: PropTypes.func,
    rejectName: PropTypes.string,
    onReject: PropTypes.func,
    onChangeShortlist: PropTypes.func,
    onClose: PropTypes.func.isRequired,
  }

  static defaultProps = {
    application: null,
    resolveName: '',
    onResolve: null,
    rejectName: '',
    onReject: null,
    onChangeShortlist: () => {},
  }

  constructor(props) {
    super(props);
    this.state = {
      shortlisted: (this.props.application && this.props.application.shortlisted) || false
    };
  }

  onPlayPitch = () => window.open(this.props.jobSeeker.pitches[0].video);
  onCVView = () => window.open(this.props.jobSeeker.cv);

  onChangeShortlist = e => {
    const shortlisted = e.target.checked;
    this.props.onChangeShortlist(shortlisted);
    this.setState({ shortlisted });
  };

  render() {
    const {
      staticData, application, jobSeeker,
      resolveName, onResolve, rejectName, onReject, onClose } = this.props;

    const img = utils.getJobSeekerImg(jobSeeker);
    const fullName = utils.getJobSeekerFullName(jobSeeker);
    let subTitle = jobSeeker.age_public && jobSeeker.age ? `${jobSeeker.age} ` : '';
    if (jobSeeker.sex_public && jobSeeker.sex) {
      const sex = staticData.sexes.filter(item => item.id === jobSeeker.sex)[0];
      subTitle = `${subTitle}${sex.short_name}`;
    }

    const established = utils.getItemByName(staticData.applicationStatuses, 'ESTABLISHED');
    const connected = application && application.status === established.id;
    let contact;
    if (connected) {
      contact = jobSeeker.email_public ? jobSeeker.email : '';
      if (jobSeeker.mobile_public && jobSeeker.mobile) {
        contact = `${contact}${contact !== '' ? '\n' : ''}${jobSeeker.mobile}`;
      }
      if (contact === '') {
        contact = 'No contact details supplied';
      }
    }

    return (
      <Modal show onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Job Seeker Detail</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={styles.topContainer}>
            <img src={img} alt="" />
            <div className={styles.right} >
              <div className={styles.title}>
                <h4>{fullName}</h4>
              </div>
              {subTitle !== '' && <div>{subTitle}</div>}
              {
                jobSeeker.pitches.length > 0 &&
                <button
                  className="btn-icon"
                  onClick={this.onPlayPitch}
                >
                  <i className="fa fa-play-circle-o" />Video Pitch
                </button>
              }
            </div>
          </div>
          <div className={styles.overview}>
            <h4>Overview</h4>
            <div>{jobSeeker.description}</div>
            {
              jobSeeker.cv &&
              <Button
                type="button"
                bsStyle="warning"
                onClick={this.onCVView}
              >CV View</Button>
            }
            {
              jobSeeker.has_references &&
              <div className={styles.available}>
                <i className="fa fa-check-square-o" aria-hidden="true" />
                Reference available on request
              </div>
            }
            {
              jobSeeker.truth_confirmation &&
              <div className={styles.truthful}>
                <i className="fa fa-check-square-o" aria-hidden="true" />
                I confirm that all information provided is truthful to the best of my knowledge
              </div>
            }
          </div>
          {
            connected &&
            <div>
              <h4>Contact</h4>
              <div style={{ whiteSpace: 'pre' }}>{contact}</div>
              <Checkbox
                onChange={this.onChangeShortlist}
                checked={this.state.shortlisted}
              >
                Shortlisted
              </Checkbox>
            </div>
          }
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            onClick={onClose}
          >Close</Button>
          {
            onReject &&
            <Button
              type="button"
              onClick={() => onReject()}
            >{rejectName}</Button>
          }
          {
            onResolve &&
            <Button
              type="button"
              bsStyle="success"
              onClick={() => onResolve()}
            >{resolveName}</Button>
          }
        </Modal.Footer>
      </Modal>
    );
  }
}
