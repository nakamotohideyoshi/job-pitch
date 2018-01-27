import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Loading, FlexBox, MJPCard } from 'components';

import * as helper from 'utils/helper';
import { SDATA } from 'utils/data';
import { confirm } from 'redux/common';
import { getBusinesses, removeBusiness } from 'redux/recruiter/businesses';
import Wrapper from './Wrapper';

class BusinessList extends React.Component {
  componentWillMount() {
    this.props.getBusinesses();
  }

  onSelect = business => {
    this.props.history.push(`/recruiter/jobs/${business.id}`);
  };

  onAdd = () => {
    this.props.history.push(`/recruiter/jobs/add`);
  };

  onEdit = business => this.props.history.push(`/recruiter/jobs/${business.id}/edit`);

  onRemove = business => {
    const { confirm, removeBusiness } = this.props;

    confirm('Confirm', `Are you sure you want to delete ${business.name}`, [
      { outline: true },
      {
        label: 'Remove',
        color: 'yellow',
        onClick: () => {
          const workplaceCount = business.locations.length;
          if (workplaceCount === 0) {
            removeBusiness(business.id);
            return;
          }

          confirm(
            'Confirm',
            `Deleting this business will also delete ${workplaceCount} workplaces and all their jobs.
             If you want to hide the jobs instead you can deactive them.`,
            [
              { outline: true },
              {
                label: 'Remove',
                color: 'yellow',
                onClick: () => removeBusiness(business.id)
              }
            ]
          );
        }
      }
    ]);
  };

  renderBusinesses = () => {
    const { businesses } = this.props;

    if (businesses.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {SDATA.jobsStep === 1
              ? `Hi, Welcome to My Job Pitch
                Let's start by easily adding your business!`
              : `You have not added any businesses yet.`}
          </div>
          <a
            className="btn-link"
            onClick={() => {
              SDATA.jobsStep = 2;
              helper.saveData('jobs-step', 2);
              this.onAdd();
            }}
          >
            {SDATA.jobsStep === 1 ? 'Get started!' : 'Create business'}
          </a>
        </FlexBox>
      );
    }

    return (
      <Row>
        {businesses.map(business => {
          const logo = helper.getBusinessLogo(business);
          const tn = business.tokens;
          const tokenCount = `${tn} credit${tn !== 1 ? 's' : ''}`;
          const wn = business.locations.length;
          const workplaceCount = `Includes ${wn} workplace${wn !== 1 ? 's' : ''}`;

          const menus = [
            {
              label: 'Edit',
              onClick: () => this.onEdit(business)
            }
          ];
          if (businesses.length > 1) {
            menus.push({
              label: 'Remove',
              onClick: () => this.onRemove(business)
            });
          }

          return (
            <Col xs="12" sm="6" md="4" lg="3" key={business.id}>
              <MJPCard
                image={logo}
                title={business.name}
                tProperty1={tokenCount}
                bProperty1={workplaceCount}
                onClick={() => this.onSelect(business)}
                loading={business.deleting}
                menus={menus}
              />
            </Col>
          );
        })}
        <Col xs="12" sm="6" md="4" lg="3">
          {SDATA.user.can_create_businesses ? (
            <Card body onClick={() => this.onAdd()} className="add">
              Add New Business
            </Card>
          ) : (
            <Card body onClick={() => this.onAdd()} className="add">
              More than one company?
              <br />
              Get in touch!
            </Card>
          )}
        </Col>
      </Row>
    );
  };

  render() {
    const { businesses, errors } = this.props;

    return (
      <Wrapper>
        <Breadcrumb>
          <BreadcrumbItem active tag="span">
            Businesses
          </BreadcrumbItem>
        </Breadcrumb>

        {businesses ? (
          this.renderBusinesses()
        ) : !errors ? (
          <FlexBox center>
            <Loading />
          </FlexBox>
        ) : (
          <FlexBox center>
            <div className="alert-msg">Server Error!</div>
          </FlexBox>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    businesses: state.rc_businesses.businesses,
    errors: state.rc_businesses.errors
  }),
  {
    confirm,
    getBusinesses,
    removeBusiness
  }
)(BusinessList);
