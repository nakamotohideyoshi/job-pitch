import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { CheckBox, Loading } from 'components';
import * as utils from 'helpers/utils';
import styles from './JobSeekerDetail.scss';

export default class JobSeekerDetail extends Component {
  static propTypes = {
    jobSeeker: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    button1: PropTypes.object,
    button2: PropTypes.object,
    application: PropTypes.object,
    onChangeShortlist: PropTypes.func,
  }

  static defaultProps = {
    button1: null,
    button2: null,
    application: null,
    onChangeShortlist: null,
  }

  constructor(props) {
    super(props);

    const { application } = this.props;
    this.state = {
      shortlisted: application && application.shortlisted
    };
  }

  onPlayPitch = () => window.open(this.props.jobSeeker.pitches[0].video);

  onCVView = () => window.open(this.props.jobSeeker.cv);

  onChangeShortlist = event => {
    const { onChangeShortlist } = this.props;
    if (onChangeShortlist) {
      const shortlisted = event.target.checked;
      this.setState({ loading: true });

      onChangeShortlist(shortlisted)
        .then(() => {
          this.setState({
            loading: false,
            shortlisted
          });
        });
    }
  };

  onClose = callback => {
    callback();
    this.props.onClose();
  }

  renderShortlisted() {
    if (this.state.loading) {
      return (
        <div className={styles.loading}>
          <Loading size="18px" />
        </div>
      );
    }

    return (
      <CheckBox
        className={styles.shortlisted}
        checked={this.state.shortlisted}
        onChange={this.onChangeShortlist}
      >Shortlisted</CheckBox>
    );
  }

  render() {
    const { jobSeeker, application, button1, button2, onClose } = this.props;
    const image = utils.getJobSeekerImg(jobSeeker);
    const fullName = utils.getJobSeekerFullName(jobSeeker);
    let subTitle = jobSeeker.age_public && jobSeeker.age ? `${jobSeeker.age} ` : '';
    if (jobSeeker.sex_public && jobSeeker.sex) {
      const sex = utils.getSexById(jobSeeker.sex);
      subTitle = `${subTitle}${sex.short_name}`;
    }

    const established = application && application.status === utils.getApplicationStatusByName('ESTABLISHED').id;

    let contact;
    if (established) {
      contact = jobSeeker.email_public ? jobSeeker.email : '';
      if (jobSeeker.mobile_public && jobSeeker.mobile) {
        contact = `${contact}${contact !== '' ? '\n' : ''}${jobSeeker.mobile}`;
      }
      if (contact === '') {
        contact = 'No contact details supplied';
      }
    }

    return (
      <Modal show onHide={onClose} bsStyle="lg">
        <Modal.Header closeButton>
          <Modal.Title>JobSeeker Detail</Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.body}>

          <div className="board padding-30">
            <div className={styles.info}>
              <img src={image} alt="" />
              <div className={styles.content}>
                <div className={styles.name}>
                  <h4>{fullName}</h4>
                  { established && this.renderShortlisted() }
                </div>
                {
                  subTitle !== '' &&
                  <div className={styles.subTitle}>{subTitle}</div>
                }
                {
                  jobSeeker.pitches.length > 0 &&
                  <div>
                    <button
                      className="btn-icon"
                      onClick={this.onPlayPitch}
                    >
                      <i className="fa fa-play-circle-o" />Video Pitch
                    </button>
                  </div>
                }
              </div>
            </div>

            <hr />

            <div className={styles.overview}>
              <h4>Overview</h4>
              <div className="description">{jobSeeker.description}</div>
              {
                jobSeeker.cv &&
                <Button
                  type="button"
                  bsStyle="warning"
                  onClick={this.onCVView}
                >CV View</Button>
              }
            </div>

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
            contact &&
            <div className="board padding-30">
              <div className={styles.contact}>
                <h4>Contact</h4>
                <div className="description">{contact}</div>
              </div>
            </div>
          }
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
