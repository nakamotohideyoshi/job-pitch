import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Scroll from 'react-scroll';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './JobEdit.scss';

@connect(
  () => ({}),
  { ...commonActions }
)
export default class JobEdit extends FormComponent {

  static propTypes = {
    parent: PropTypes.object.isRequired,
    job: PropTypes.object,
    loadingShow: PropTypes.func.isRequired,
    loadingHide: PropTypes.func.isRequired,
  }

  static defaultProps = {
    job: {},
  }

  constructor(props) {
    const { job } = props;
    const formModel = Object.assign({}, job);
    if (formModel.id) {
      formModel.active = job.status === utils.getJobStatusByName('OPEN').id;
      formModel.sector = utils.getSectorById(job.sector);
      formModel.contract = utils.getContractById(job.contract);
      formModel.hours = utils.getHoursById(job.hours);
    }
    const logo = {
      default: utils.getWorkplaceLogo(job.location_data),
      url: utils.getJobLogo(job),
      exist: job.images && job.images.length > 0,
    };

    super(props, { formModel, logo, needToSave: true });
    this.manager = this.props.parent.manager;
    this.api = ApiClient.shared();
    this.loadImage(logo, 'logo');
  }

  onSave = () => {
    if (!this.isValid(['title', 'sector', 'contract', 'hours', 'description'])) return;

    const { formModel, logo } = this.state;
    const data = Object.assign(this.props.job, formModel);
    data.status = utils.getJobStatusByName(formModel.active ? 'OPEN' : 'CLOSED').id;
    data.sector = formModel.sector && formModel.sector.id;
    data.contract = formModel.contract && formModel.contract.id;
    data.hours = formModel.hours && formModel.hours.id;

    this.props.loadingShow('Saving...', true);

    this.api.saveUserJob(data).then(
      job => {
        formModel.id = job.id;

        if (logo.file) {
          return this.api.uploadJobLogo(
            {
              job: job.id,
              image: logo.file,
            },
            event => {
              console.log(event);
            }
          );
        }
        if (job.images.length > 0 && !logo.exist) {
          return this.api.deleteJobLogo(job.images[0].id);
        }
      }
    ).then(
      () => {
        FormComponent.needToSave = false;
        utils.successNotif('Saved!');
        this.props.loadingHide();
        this.manager.loadJobs();
        this.onClose();
      },
      () => this.props.loadingHide()
    );
  }

  onClose = () => this.manager.closeEdit(this.props.parent);

  render() {
    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{this.props.job.id ? 'Edit' : 'Add'} Job</h4>
        </div>

        <Form>
          <div className={styles.container1}>
            <this.ImageField name="logo" />
            <div className={styles.content}>
              <FormGroup>
                <ControlLabel>Active</ControlLabel>
                <this.CheckBoxField label="" name="active" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Title</ControlLabel>
                <Scroll.Element name="title">
                  <this.TextField type="text" name="title" />
                </Scroll.Element>
              </FormGroup>
            </div>
          </div>
          <FormGroup>
            <Scroll.Element name="sector">
              <ControlLabel>Sector</ControlLabel>
            </Scroll.Element>
            <this.SelectField
              placeholder="Select Sector"
              name="sector"
              options={this.api.sectors}
            />
          </FormGroup>
          <FormGroup>
            <Scroll.Element name="contract">
              <ControlLabel>Contract</ControlLabel>
            </Scroll.Element>
            <this.SelectField
              placeholder="Select Contract"
              name="contract"
              options={this.api.contracts}
              searchable={false}
            />
          </FormGroup>
          <FormGroup>
            <Scroll.Element name="hours">
              <ControlLabel>Hours</ControlLabel>
            </Scroll.Element>
            <this.SelectField
              placeholder="Select Hours"
              name="hours"
              options={this.api.hours}
              searchable={false}
            />
          </FormGroup>
          <FormGroup>
            <Scroll.Element name="description">
              <ControlLabel>Description</ControlLabel>
            </Scroll.Element>
            <this.TextAreaField
              name="description"
              maxLength="10000"
              minRows={3}
              maxRows={20}
            />
          </FormGroup>
        </Form>

        <div className={styles.footer}>
          <this.SubmitButtonWithCancel
            submtting={this.state.saving}
            labels={['Save', 'Saving...']}
            onClick={this.onSave}
            cancelLabel="Cancel"
            onCancel={this.onClose}
          />
        </div>
      </div>
    );
  }
}
