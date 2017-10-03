import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import { FormComponent } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import _ from 'lodash';
import styles from './JobEdit.scss';

export default class JobEdit extends FormComponent {
  static propTypes = {
    job: PropTypes.object,
    parent: PropTypes.object.isRequired,
  }

  static defaultProps = {
    job: {},
  }

  constructor(props) {
    const api = ApiClient.shared();
    const { job } = props;
    const formModel = Object.assign({}, job);
    if (!formModel.id) {
      formModel.active = true;
    } else {
      formModel.active = utils.getJobStatus(job, api.jobStatuses) === 'OPEN';
      formModel.sector = api.sectors.filter(item => item.id === job.sector)[0];
      formModel.contract = api.contracts.filter(item => item.id === job.contract)[0];
      formModel.hours = api.hours.filter(item => item.id === job.hours)[0];
    }
    const logo = {
      default: utils.getWorkplaceLogo(job.location_data),
      url: utils.getJobLogo(job),
      exist: job.images && job.images.length > 0,
    };

    super(props, { formModel, logo });
    this.api = ApiClient.shared();
    this.loadImage(logo, 'logo');
  }

  onSave = () => {
    if (!this.isValid(['title', 'description', 'sector', 'contract', 'hours'])) return;

    const { formModel, logo } = this.state;
    const data = Object.assign(this.props.job, formModel);
    const i = _.findIndex(this.api.jobStatuses, { name: formModel.active ? 'OPEN' : 'CLOSED' });
    data.status = this.api.jobStatuses[i].id;
    data.sector = formModel.sector && formModel.sector.id;
    data.contract = formModel.contract && formModel.contract.id;
    data.hours = formModel.hours && formModel.hours.id;

    this.setState({ saving: true });

    this.api.saveUserJob(data).then(
      job => {
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
        this.props.parent.onRefresh();
        this.props.parent.onEdit();
        utils.successNotif('Saved!');
      },
      () => this.setState({ saving: false })
    );
  }

  render() {
    return (
      <div className={styles.root}>

        <div className={styles.header}>
          <h4>{this.props.job.id ? 'Edit' : 'Add'} Job</h4>
          <Link onClick={() => this.props.parent.onEdit()}>{'<< Back'}</Link>
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
              dataSource={this.api.sectors}
              searchable
              searchPlaceholder="Search"
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Contract</ControlLabel>
            <this.SelectField
              placeholder="Select Contract"
              name="contract"
              dataSource={this.api.contracts}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Hours</ControlLabel>
            <this.SelectField
              placeholder="Select Hours"
              name="hours"
              dataSource={this.api.hours}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <this.TextAreaField
              name="description"
              maxLength="1000"
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
            onCancel={() => this.props.parent.onEdit()}
          />
        </div>
      </div>
    );
  }
}
