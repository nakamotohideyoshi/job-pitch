import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Card, Row, Col, Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { Loading, FlexBox, MJPCard } from 'components';

import * as helper from 'utils/helper';
import { SDATA } from 'utils/data';
import { confirm } from 'redux/common';
import { getWorkplaces, removeWorkplace } from 'redux/recruiter/workplaces';
import Wrapper from './Wrapper';

class WorkplaceList extends React.Component {
  componentWillMount() {
    const businessId = helper.str2int(this.props.match.params.businessId);
    if (businessId) {
      this.props.getWorkplaces(businessId);
    }
  }

  onSelect = workplace => {
    const { businessId } = this.props.match.params;
    this.props.history.push(`/recruiter/jobs/${businessId}/${workplace.id}`);
  };

  onAdd = () => {
    const { businessId } = this.props.match.params;
    this.props.history.push(`/recruiter/jobs/${businessId}/add`);
    //   if (utils.getShared('first-time') === '2') {
    //     utils.setShared('first-time', '3');
    //   }
    //   this.setState({
    //     editingData: {
    //       business: this.manager.getBusinessId(),
    //       email: utils.getCookie('email'),
    //       email_public: true,
    //       mobile_public: true
    //     }
    //   });
  };

  onEdit = workplace => {
    const { businessId } = this.props.match.params;
    this.props.history.push(`/recruiter/jobs/${businessId}/${workplace.id}/edit`);
  };

  onRemove = workplace => {
    const { confirm, removeWorkplace } = this.props;

    confirm('Confirm', `Are you sure you want to delete ${workplace.name}`, [
      { outline: true },
      {
        label: 'Remove',
        color: 'yellow',
        onClick: () => {
          const jobCount = workplace.jobs.length;
          if (jobCount === 0) {
            removeWorkplace(workplace.id);
            return;
          }

          confirm(
            'Confirm',
            `Deleting this workplace will also delete ${jobCount} jobs.
            If you want to hide the jobs instead you can deactive them.`,
            [
              { outline: true },
              {
                label: 'Remove',
                color: 'yellow',
                onClick: () => removeWorkplace(workplace.id)
              }
            ]
          );
        }
      }
    ]);
  };

  renderWorkplaces = () => {
    const { workplaces } = this.props;

    if (workplaces.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            {SDATA.jobsStep === 2
              ? `Great, you've created your business!
                Now let's create your work place`
              : "This business doesn't seem to have a workplace for your staff"}
          </div>
          <a
            className="btn-link"
            onClick={() => {
              SDATA.jobsStep = 3;
              helper.saveData('jobs-step', 3);
              this.onAdd();
            }}
          >
            Create workplace
          </a>
        </FlexBox>
      );
    }

    return (
      <Row>
        {workplaces.map(workplace => {
          const logo = helper.getWorkplaceLogo(workplace);
          const jn = workplace.jobs.length;
          const jobCount = `Includes ${jn} job${jn !== 1 ? 's' : ''}`;
          const jcn = jn - workplace.active_job_count;
          const closedCount = `${jcn} inactive`;

          return (
            <Col xs="12" sm="6" md="4" lg="3" key={workplace.id}>
              <MJPCard
                image={logo}
                title={workplace.name}
                tProperty1={
                  <span>
                    <i class="fa fa-map-marker" style={{ marginRight: '5px' }} />
                    {workplace.place_name}
                  </span>
                }
                bProperty1={jobCount}
                bProperty2={closedCount}
                onClick={() => this.onSelect(workplace)}
                loading={workplace.deleting}
                menus={[
                  {
                    label: 'Edit',
                    onClick: () => this.onEdit(workplace)
                  },
                  {
                    label: 'Remove',
                    onClick: () => this.onRemove(workplace)
                  }
                ]}
              />
            </Col>
          );
        })}
        <Col xs="12" sm="6" md="4" lg="3">
          <Card body onClick={() => this.onAdd()} className="add">
            Add New Workplace
          </Card>
        </Col>
      </Row>
    );
  };

  render() {
    const { workplaces, errors } = this.props;

    return (
      <Wrapper>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/recruiter/jobs">Businesses</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active tag="span">
            Workplaces
          </BreadcrumbItem>
        </Breadcrumb>

        {workplaces ? (
          this.renderWorkplaces()
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
    workplaces: state.rc_workplaces.workplaces,
    errors: state.rc_workplaces.errors
  }),
  {
    confirm,
    getWorkplaces,
    removeWorkplace
  }
)(WorkplaceList);
