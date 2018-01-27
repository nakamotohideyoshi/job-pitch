import React from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem, Button, Form, FormGroup, Label, Alert } from 'reactstrap';
import { SaveFormComponent, Board, Loading, Required, PopupProgress } from 'components';

import * as helper from 'utils/helper';
import { SDATA } from 'utils/data';
import { confirm } from 'redux/common';
import { getBusiness, saveBusiness } from 'redux/recruiter/businesses';
import Wrapper from './Wrapper';

class BusinessEdit extends SaveFormComponent {
  componentWillMount() {
    const businessId = parseInt(this.props.match.params.businessId, 10);
    this.props.getBusiness(businessId);
  }

  componentWillReceiveProps(nextProps) {
    const { business } = nextProps;
    if (business && business !== this.props.business) {
      const model = Object.assign(this.state.model, business);
      this.setState({
        model,
        logo: {
          default: helper.getBusinessLogo(),
          url: helper.getBusinessLogo(business),
          exist: (business.images || []).length > 0
        }
      });
    }
  }

  onAddCredit = () => {
    //   const { business, confirm } = this.props;
    //   if (!FormComponent.needToSave) {
    //     utils.setShared('credits_business_id', business.id);
    //     // browserHistory.push('/recruiter/credits');
    //     return;
    //   }
    //   confirm('Confirm', 'Are you sure you want to discard your changes?', [
    //     { label: 'No' },
    //     {
    //       label: 'Yes',
    //       style: 'success',
    //       onClick: () => {
    //         FormComponent.needToSave = false;
    //         utils.setShared('credits_business_id', business.id);
    //         // browserHistory.push('/recruiter/credits');
    //       }
    //     }
    //   ]);
  };

  onSave = () => {
    if (!this.isValid(['name'])) return;

    const data = Object.assign({}, this.state.model);
    this.props.saveBusiness(data, this.state.logo, (label, value) => {
      const progress = label ? { label, value } : null;
      this.setState({ progress });
    });
    //     .then(
    //       () => {
    //         if (this.api.user.businesses.length === 0) {
    //           this.props.setPermission(1);
    //         }
    //         FormComponent.needToSave = false;
    //         utils.successNotif('Saved!');
    //         this.props.loadingHide();
    //         if (utils.getShared('first-time') === '2') {
    //           this.manager.selectBusiness(formModel.id);
    //         } else {
    //           this.manager.getBusinesses();
    //           this.onClose();
    //         }
    //       },
    //       () => this.props.loadingHide()
    //     );
  };

  onCancel = () => {
    helper.routePush(`/recruiter/jobs`, this.props);
  };

  onRoutePush = to => {
    helper.routePush(to, this.props);
  };

  render() {
    const { business, errors } = this.props;
    const creditsLabel = (business || {}).id
      ? `${business.tokens} Credit${business.tokens !== 1 ? 's' : ''}`
      : `${SDATA.initTokens.tokens} free credits`;
    const error = this.getError();
    const { progress } = this.state;

    return (
      <Wrapper>
        <Breadcrumb>
          <BreadcrumbItem tag="a" onClick={() => this.onRoutePush(`/recruiter/jobs`)}>
            Businesses
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            {business ? (business.id ? 'Edit' : 'Add') : ''}
          </BreadcrumbItem>
        </Breadcrumb>

        {business ? (
          <Board block className="board">
            <Form>
              <div className="logo-container">
                <FormGroup>
                  <this.FormLogoSelect />
                </FormGroup>
              </div>

              <div className="right-container">
                <FormGroup>
                  <Label>
                    Name<Required />
                  </Label>
                  <this.FormInput name="name" />
                </FormGroup>

                <FormGroup>
                  <Label>Credits</Label>
                  <div className="credit">
                    <span>{creditsLabel}</span>
                    {business.id && (
                      <Button color="yellow" outline onClick={this.onAddCredit}>
                        Add Credits
                      </Button>
                    )}
                  </div>
                </FormGroup>
              </div>

              {error && <Alert color="danger">{error}</Alert>}

              <div>
                <Button color="green" size="lg" disabled={business.saving} onClick={this.onSave}>
                  {business.saving ? 'Saving...' : 'Save'}
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
    business: state.rc_businesses.selectedBusiness,
    errors: state.rc_businesses.errors
  }),
  { confirm, getBusiness, saveBusiness }
)(BusinessEdit);
