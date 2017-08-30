import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Form from 'react-bootstrap/lib/Form';
import { FormComponent } from 'components';
import * as jobmanagerActions from 'redux/modules/jobmanager';
import * as utils from 'helpers/utils';
import _ from 'lodash';

@connect(
  state => ({
    staticData: state.auth.staticData,
    saving: state.jobmanager.saving,
    selectedWorkPlace: state.jobmanager.selectedWorkPlace,
  }),
  { ...jobmanagerActions })
export default class JobEdit extends FormComponent {
  static propTypes = {
    staticData: PropTypes.object.isRequired,
    saving: PropTypes.bool.isRequired,
    selectedWorkPlace: PropTypes.object.isRequired,
    saveUserJob: PropTypes.func.isRequired,
    uploadJobLogo: PropTypes.func.isRequired,
    deleteJobLogo: PropTypes.func.isRequired,
    job: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  componentDidMount() {
    Promise.resolve(this.props.job).then(job => {
      const formModel = Object.assign({}, job);
      if (!formModel.id) {
        formModel.active = true;
      } else {
        const { staticData } = this.props;
        formModel.active = utils.getJobStatus(job, staticData.jobStatuses) === 'OPEN';
        formModel.sector = staticData.sectors.filter(item => item.id === job.sector)[0];
        formModel.contract = staticData.contracts.filter(item => item.id === job.contract)[0];
        formModel.hours = staticData.hours.filter(item => item.id === job.hours)[0];
      }
      const logo = {
        default: utils.getWorkPlaceLogo(job.location_data),
        url: utils.getJobLogo(job),
        exist: job.images && job.images.length > 0,
      };
      this.setState({ formModel, logo });
    });
  }

  onClose = () => this.props.onClose();

  onSave = () => {
    if (!this.isValid(['title', 'description', 'sector', 'contract', 'hours'])) return;

    const { staticData, selectedWorkPlace, saveUserJob, uploadJobLogo, deleteJobLogo, onClose } = this.props;
    const { formModel, logo } = this.state;
    const data = Object.assign(this.props.job, formModel);
    const i = _.findIndex(staticData.jobStatuses, { name: formModel.active ? 'OPEN' : 'CLOSED' });
    data.status = staticData.jobStatuses[i].id;
    data.location = selectedWorkPlace.id;
    data.sector = formModel.sector && formModel.sector.id;
    data.contract = formModel.contract && formModel.contract.id;
    data.hours = formModel.hours && formModel.hours.id;

    saveUserJob(data).then(job => {
      if (logo.file) {
        return uploadJobLogo(
          {
            job: job.id,
            image: logo.file,
          },
          event => {
            console.log(event);
          }
        ).then(() => {
          utils.successNotif('Saved!');
          onClose(job);
        });
      }
      if (job.images.length > 0 && !logo.exist) {
        return deleteJobLogo(job.images[0].id)
          .then(() => {
            utils.successNotif('Saved!');
            onClose(job);
          });
      }
      utils.successNotif('Saved!');
      onClose(job);
    });
  }

  render() {
    const { staticData, job, saving } = this.props;
    return (
      <Modal show onHide={this.onClose} backdrop="static">
        <Form horizontal>
          <Modal.Header closeButton={saving === false}>
            <Modal.Title>{job.id ? 'Edit' : 'Add'} Job</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <this.CheckBoxGroup
              label="Active"
              name="active"
            />
            <this.TextFieldGroup
              type="text"
              label="Title"
              name="title"
            />
            <this.TextFieldGroup
              componentClass="textarea"
              label="Description"
              name="description"
            />
            <this.SelectFieldGroup
              label="Sector"
              placeholder="Select Sector"
              name="sector"
              dataSource={staticData.sectors}
              searchable
              searchPlaceholder="Search"
            />
            <this.SelectFieldGroup
              label="Contract"
              placeholder="Select Contract"
              name="contract"
              dataSource={staticData.contracts}
            />
            <this.SelectFieldGroup
              label="Hours"
              placeholder="Select Hours"
              name="hours"
              dataSource={staticData.hours}
            />
            <this.ImageFieldGroup
              label="Logo"
              name="logo"
            />
          </Modal.Body>

          <Modal.Footer>
            <this.SubmitCancelButtons
              submtting={saving}
              labels={['Save', 'Saving...']}
              onClick={this.onSave}
              cancelLabel="Cancel"
              onCancel={this.onClose}
            />
          </Modal.Footer>

        </Form>
      </Modal>
    );
  }
}
