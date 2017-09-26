import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import _ from 'lodash';
import styles from './JobEdit.scss';

@connect(
  (state) => ({
    saving: state.api.loading
  }),
  { ...apiActions }
)
export default class JobEdit extends FormComponent {
  static propTypes = {
    saving: PropTypes.bool.isRequired,
    saveUserJobAction: PropTypes.func.isRequired,
    uploadJobLogoAction: PropTypes.func.isRequired,
    deleteJobLogoAction: PropTypes.func.isRequired,
    workplaceId: PropTypes.number.isRequired,
    job: PropTypes.object,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    job: {},
  }

  constructor(props) {
    const { job } = props;
    const formModel = Object.assign({}, job);
    if (!formModel.id) {
      formModel.active = true;
    } else {
      formModel.active = utils.getJobStatus(job, ApiClient.jobStatuses) === 'OPEN';
      formModel.sector = ApiClient.sectors.filter(item => item.id === job.sector)[0];
      formModel.contract = ApiClient.contracts.filter(item => item.id === job.contract)[0];
      formModel.hours = ApiClient.hours.filter(item => item.id === job.hours)[0];
    }
    const logo = {
      default: utils.getWorkplaceLogo(job.location_data),
      url: utils.getJobLogo(job),
      exist: job.images && job.images.length > 0,
    };
    super(props, { formModel, logo });
    this.loadImage(logo, 'logo');
  }

  onBack = () => {
    this.props.parent.onEdit();
  }

  onSave = () => {
    if (!this.isValid(['title', 'description', 'sector', 'contract', 'hours'])) return;

    const { workplaceId, saveUserJobAction, uploadJobLogoAction, deleteJobLogoAction } = this.props;
    const { formModel, logo } = this.state;
    const data = Object.assign(this.props.job, formModel);
    const i = _.findIndex(ApiClient.jobStatuses, { name: formModel.active ? 'OPEN' : 'CLOSED' });
    data.status = ApiClient.jobStatuses[i].id;
    data.location = workplaceId;
    data.sector = formModel.sector && formModel.sector.id;
    data.contract = formModel.contract && formModel.contract.id;
    data.hours = formModel.hours && formModel.hours.id;

    saveUserJobAction(data).then(job => {
      if (logo.file) {
        return uploadJobLogoAction(
          {
            location: job.id,
            image: logo.file,
          },
          event => {
            console.log(event);
          }
        ).then(() => this.saveSuccess);
      }
      if (job.images.length > 0 && !logo.exist) {
        return deleteJobLogoAction(job.images[0].id)
          .then(() => this.saveSuccess);
      }
      this.saveSuccess();
    });
  }

  saveSuccess = () => {
    this.onBack();
    this.props.parent.onRefresh();
    utils.successNotif('Saved!');
  }

  render() {
    const { saving, job } = this.props;

    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{job.id ? 'Edit' : 'Add'} Job</h4>
          <Link className="link" onClick={this.onBack}>{'<< Job List'}</Link>
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
              dataSource={ApiClient.sectors}
              searchable
              searchPlaceholder="Search"
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Contract</ControlLabel>
            <this.SelectField
              placeholder="Select Contract"
              name="contract"
              dataSource={ApiClient.contracts}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Hours</ControlLabel>
            <this.SelectField
              placeholder="Select Hours"
              name="hours"
              dataSource={ApiClient.hours}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <this.TextField
              componentClass="textarea"
              name="description"
            />
          </FormGroup>
        </Form>

        <div className={styles.footer}>
          <this.SubmitButton
            submtting={saving}
            labels={['Save', 'Saving...']}
            onClick={this.onSave}
          />
        </div>

      </div>
    );
  }
}
