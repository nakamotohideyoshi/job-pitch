import React from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem, Button, Form, FormGroup, Label, Row, Col, Alert } from 'reactstrap';

import { SaveFormComponent, Board, Loading, Required, PopupProgress } from 'components';
import { confirm } from 'redux/common';
import { getJob, saveJob } from 'redux/recruiter/jobs';
import { SDATA } from 'utils/data';
import * as helper from 'utils/helper';
import Wrapper from './Wrapper';

class JobEdit extends SaveFormComponent {
  componentWillMount() {
    const jobId = parseInt(this.props.match.params.jobId, 10);
    this.props.getJob(jobId);
  }

  componentWillReceiveProps(nextProps) {
    const { job } = nextProps;
    if (job && job !== this.props.job) {
      const model = Object.assign(this.state.model, job);
      model.active = job.status === helper.getJobStatusByName('OPEN');
      model.location = model.location || this.props.match.params.workplaceId;
      this.setState({
        model,
        logo: {
          default: helper.getWorkplaceLogo(job.location_data),
          url: helper.getJobLogo(job),
          exist: (job.images || []).length > 0
        }
      });
    }
  }

  onSave = () => {
    if (!this.isValid(['title', 'sector', 'contract', 'hours', 'description'])) return;

    const data = Object.assign({}, this.state.model);
    data.status = helper.getJobStatusByName(data.active ? 'OPEN' : 'CLOSED');
    this.props.saveJob(data, this.state.logo, (label, value) => {
      const progress = label ? { label, value } : null;
      this.setState({ progress });
    });
  };

  onCancel = () => {
    const { businessId, workplaceId } = this.props.match.params;
    helper.routePush(`/recruiter/jobs/${businessId}/${workplaceId}`, this.props);
  };

  onRoutePush = to => {
    helper.routePush(to, this.props);
  };

  render() {
    const { job, errors } = this.props;
    const error = this.getError();
    const { progress } = this.state;

    return (
      <Wrapper>
        <Breadcrumb>
          <BreadcrumbItem tag="a" onClick={() => this.onRoutePush(`/recruiter/jobs`)}>
            Businesses
          </BreadcrumbItem>
          <BreadcrumbItem
            tag="a"
            onClick={() => {
              const { businessId } = this.props.match.params;
              this.onRoutePush(`/recruiter/jobs/${businessId}`);
            }}
          >
            Workplaces
          </BreadcrumbItem>
          <BreadcrumbItem
            tag="a"
            onClick={() => {
              const { businessId, workplaceId } = this.props.match.params;
              this.onRoutePush(`/recruiter/jobs/${businessId}/${workplaceId}`);
            }}
          >
            Jobs
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            {(job || {}).id ? 'Edit' : 'Add'}
          </BreadcrumbItem>
        </Breadcrumb>

        {job ? (
          <Board block>
            <Form>
              <div className="logo-container">
                <FormGroup>
                  <this.FormLogoSelect />
                </FormGroup>
              </div>

              <div className="right-container">
                <FormGroup>
                  <this.FormCheckbox name="active" label="Active" />
                </FormGroup>

                <FormGroup>
                  <Label>
                    Title<Required />
                  </Label>
                  <this.FormInput name="title" />
                </FormGroup>

                <FormGroup>
                  <Label>
                    Sector<Required />
                  </Label>
                  <this.FormSelect name="sector" options={SDATA.sectors} />
                </FormGroup>
              </div>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>
                      Contract<Required />
                    </Label>
                    <this.FormSelect name="contract" options={SDATA.contracts} searchable={false} />
                  </FormGroup>
                </Col>

                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>
                      Hours<Required />
                    </Label>
                    <this.FormSelect name="hours" options={SDATA.hours} searchable={false} />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>
                  Description<Required />
                </Label>
                <this.FormTextArea name="description" maxLength="10000" minRows={3} maxRows={20} />
              </FormGroup>

              {error && <Alert color="danger">{error}</Alert>}

              <div>
                <Button color="green" size="lg" disabled={job.saving} onClick={this.onSave}>
                  {job.saving ? 'Saving...' : 'Save'}
                </Button>
                <Button color="gray" size="lg" outline onClick={this.onCancel}>
                  Cancel
                </Button>
              </div>

              {progress && <PopupProgress label={progress.label} value={progress.value} />}
            </Form>
          </Board>
        ) : !errors ? (
          <Loading />
        ) : (
          <Alert type="danger">Error!</Alert>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    job: state.rc_jobs.selectedJob,
    errors: state.rc_jobs.errors
  }),
  { confirm, getJob, saveJob }
)(JobEdit);
