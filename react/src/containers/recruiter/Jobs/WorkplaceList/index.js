import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Modal } from 'antd';

import { getWorkplaces, removeWorkplace } from 'redux/recruiter/workplaces';
import * as helper from 'utils/helper';

import { PageSubHeader, AlertMsg, Loading, Logo } from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

class WorkplaceList extends React.Component {
  componentWillMount() {
    const { match, getWorkplaces, refreshList } = this.props;
    this.businessId = parseInt(match.params.businessId, 10);
    if (refreshList) {
      getWorkplaces({
        id: this.businessId
      });
    }
  }

  selectWorkplace = ({ id }) => {
    const { history } = this.props;
    history.push(`/recruiter/jobs/job/${id}`);
  };

  addWorkplace = () => {
    const { history } = this.props;
    history.push(`/recruiter/jobs/workplace/add/${this.businessId}`);
  };

  editWorkplace = ({ id }, e) => {
    e && e.stopPropagation();

    const { history } = this.props;
    history.push(`/recruiter/jobs/workplace/edit/${id}`);
  };

  removeWorkplace = ({ id, name, jobs }, e) => {
    e && e.stopPropagation();

    const { removeWorkplace } = this.props;
    confirm({
      title: `Are you sure you want to delete ${name}`,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        const jobCount = jobs.length;
        if (jobCount === 0) {
          removeWorkplace({ id });
          return;
        }

        confirm({
          title: `Deleting this workplace will also delete ${jobCount} jobs.
          If you want to hide the jobs instead you can deactive them.`,
          okText: `Remove`,
          okType: 'danger',
          cancelText: 'Cancel',
          maskClosable: true,
          onOk: () => {
            removeWorkplace(id);
          }
        });
      }
    });
  };

  renderWorkplace = workplace => {
    const logo = helper.getWorkplaceLogo(workplace);
    const jn = workplace.jobs.length;
    const jobCount = `Includes ${jn} job${jn !== 1 ? 's' : ''}`;
    const jcn = jn - workplace.active_job_count;
    const closedCount = `${jcn} inactive`;

    return (
      <List.Item
        key={workplace.id}
        actions={[
          <span onClick={e => this.editWorkplace(workplace, e)}>Edit</span>,
          <span onClick={e => this.removeWorkplace(workplace, e)}>Remove</span>
        ]}
        onClick={() => this.selectWorkplace(workplace)}
      >
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" />}
          title={`${workplace.name}`}
          description={
            <div>
              <div className="properties">
                <span>{jobCount}</span>
                <span>{closedCount}</span>
              </div>
              <div>{workplace.description}</div>
            </div>
          }
        />
      </List.Item>
    );
  };

  renderWorkplaces = () => {
    const { workplaces, loading } = this.props;

    if (workplaces.length === 0) {
      if (loading) {
        return <Loading size="large" />;
      }

      return (
        <AlertMsg>
          <span>{`Empty`}</span>
          {/* <a onClick={this.props.getJobs}>
            <FontAwesomeIcon icon={faSyncAlt} />
            Refresh
          </a> */}
        </AlertMsg>
        //   <div className="alert-msg">
        //     {DATA.jobsStep === 2
        //       ? `Great, you've created your business!
        //         Now let's create your work place`
        //       : "This business doesn't seem to have a workplace for your staff"}
        //   </div>
        //   <a
        //     className="btn-link"
        //     onClick={() => {
        //       DATA.jobsStep = 3;
        //       helper.saveData('jobs-step', 3);
        //       this.onAdd();
        //     }}
        //   >
        //     Create workplace
        //   </a>
      );
    }

    return (
      <List itemLayout="horizontal" dataSource={workplaces} loading={loading} renderItem={this.renderWorkplace} />
      // <Col xs="12" sm="6" md="4" lg="3" key={workplace.id}>
      //   <MJPCard
      //     image={logo}
      //     title={workplace.name}
      //     tProperty1={
      //       <span>
      //         <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '5px' }} />
      //         {workplace.place_name}
      //       </span>
      //     }
      //     bProperty1={jobCount}
      //     bProperty2={closedCount}
      //     onClick={() => this.onSelect(workplace)}
      //     loading={workplace.deleting}
      //     menus={[
      //       {
      //         label: 'Edit',
      //         onClick: () => this.onEdit(workplace)
      //       },
      //       {
      //         label: 'Remove',
      //         onClick: () => this.onRemove(workplace)
      //       }
      //     ]}
      //   />
      // </Col>
    );
  };

  render() {
    const { error } = this.props;

    return (
      <Wrapper>
        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/jobs/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Workplaces</Breadcrumb.Item>
          </Breadcrumb>
          <Link to={`/recruiter/jobs/workplace/add/${this.businessId}`}>Add Workplace</Link>
        </PageSubHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          this.renderWorkplaces()
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    workplaces: state.rc_workplaces.workplaces,
    loading: state.rc_workplaces.loading,
    refreshList: state.rc_workplaces.refreshList,
    error: state.rc_workplaces.error
  }),
  {
    getWorkplaces,
    removeWorkplace
  }
)(WorkplaceList);
