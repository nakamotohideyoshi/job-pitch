import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './JobEdit.scss';

export default class JobEdit extends FormComponent {

  static propTypes = {
    parent: PropTypes.object.isRequired,
    job: PropTypes.object,
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
    if (!this.isValid(['title', 'description', 'sector', 'contract', 'hours'])) return;

    const { formModel, logo } = this.state;
    const data = Object.assign(this.props.job, formModel);
    data.status = utils.getJobStatusByName(formModel.active ? 'OPEN' : 'CLOSED').id;
    data.sector = formModel.sector && formModel.sector.id;
    data.contract = formModel.contract && formModel.contract.id;
    data.hours = formModel.hours && formModel.hours.id;

    this.setState({ saving: true });

    this.api.saveUserJob(data).then(
      job => {
        formModel.id = job.id;

        if (logo.file) {
          return this.api.uploadJobLogo(
            {
              location: job.id,
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
        this.manager.loadJobs();
        this.onClose();
      },
      () => this.setState({ saving: false })
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
                <this.TextField type="text" name="title" />
              </FormGroup>
            </div>
          </div>
          <FormGroup>
            <ControlLabel>Sector</ControlLabel>
            <this.SelectField
              placeholder="Select Sector"
              name="sector"
              options={this.api.sectors}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Contract</ControlLabel>
            <this.SelectField
              placeholder="Select Contract"
              name="contract"
              options={this.api.contracts}
              searchable={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Hours</ControlLabel>
            <this.SelectField
              placeholder="Select Hours"
              name="hours"
              options={this.api.hours}
              searchable={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
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
