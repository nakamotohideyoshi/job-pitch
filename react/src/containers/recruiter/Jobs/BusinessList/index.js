import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Breadcrumb, List, Spin, Modal } from 'antd';

import { PageSubHeader, AlertMsg, Loading, Logo } from 'components';
import Wrapper from './Wrapper';

import { getBusinesses } from 'redux/recruiter/businesses';
import * as helper from 'utils/helper';

const { confirm } = Modal;

class BusinessList extends React.Component {
  componentWillMount() {
    if (this.props.refreshList) {
      this.props.getBusinesses();
    }
  }

  selectBusiness = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  editBusiness = ({ id }, e) => {
    e && e.stopPropagation();
    this.props.history.push(`/recruiter/jobs/business/edit/${id}`);
  };

  removeBusiness = ({ id, name, locations }) => {
    const { removeBusiness } = this.props;

    confirm({
      title: `Are you sure you want to delete ${name}`,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        const workplaceCount = locations.length;
        if (workplaceCount === 0) {
          removeBusiness(id);
          return;
        }

        confirm({
          title: `Deleting this business will also delete ${workplaceCount} workplaces and all their jobs.
          If you want to hide the jobs instead you can deactive them.`,
          okText: `Remove`,
          okType: 'danger',
          cancelText: 'Cancel',
          maskClosable: true,
          onOk: () => {
            removeBusiness(id);
          }
        });
      }
    });
  };

  renderBusiness = business => {
    const logo = helper.getBusinessLogo(business);
    const tn = business.tokens;
    const tokenCount = `${tn} credit${tn !== 1 ? 's' : ''}`;
    const wn = business.locations.length;
    const workplaceCount = `Includes ${wn} workplace${wn !== 1 ? 's' : ''}`;

    return (
      <List.Item
        key={business.id}
        actions={[
          <span onClick={e => this.editBusiness(business, e)}>Edit</span>,
          <span onClick={e => this.removeBusiness(business, e)}>Remove</span>
        ]}
        onClick={() => this.selectBusiness(business)}
      >
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" />}
          title={`${business.name}`}
          description={
            <div className="properties">
              <span>{tokenCount}</span>
              <span>{workplaceCount}</span>
            </div>
          }
        />
      </List.Item>
    );
  };

  renderBusinesses = () => {
    const { businesses, loading, loadingItem } = this.props;

    if (businesses.length === 0) {
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
      );
    }

    // if (businesses.length === 0) {
    //   return (
    //     <FlexBox center>
    //       <div className="alert-msg">
    //         {DATA.jobsStep === 1
    //           ? `Hi, Welcome to My Job Pitch
    //             Let's start by easily adding your business!`
    //           : `You have not added any businesses yet.`}
    //       </div>
    //       <a
    //         className="btn-link"
    //         onClick={() => {
    //           DATA.jobsStep = 2;
    //           helper.saveData('jobs-step', 2);
    //           this.onAdd();
    //         }}
    //       >
    //         {DATA.jobsStep === 1 ? 'Get started!' : 'Create business'}
    //       </a>
    //     </FlexBox>
    //   );
    // }

    return (
      <List
        itemLayout="horizontal"
        dataSource={businesses}
        loading={loading}
        renderItem={b => (b.id === loadingItem ? <Spin>{this.renderBusiness(b)}</Spin> : this.renderBusiness(b))}
      />

      //   <Row>
      //     <Col xs="12" sm="6" md="4" lg="3">
      //       {DATA.user.can_create_businesses ? (
      //         <Card body onClick={() => this.onAdd()} className="add">
      //           Add New Business
      //         </Card>
      //       ) : (
      //         <Card body onClick={() => this.onAdd()} className="add">
      //           More than one company?
      //           <br />
      //           Get in touch!
      //         </Card>
      //       )}
      //     </Col>
      //   </Row>
    );
  };

  render() {
    return (
      <Wrapper>
        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>Businesses</Breadcrumb.Item>
          </Breadcrumb>
          <Link to="/recruiter/jobs/business/add">Add Business</Link>
        </PageSubHeader>

        {this.props.error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          this.renderBusinesses()
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    businesses: state.rc_businesses.businesses,
    error: state.rc_businesses.error,
    loading: state.rc_businesses.loading,
    loadingItem: state.rc_businesses.loadingItem,
    refreshList: state.rc_businesses.refreshList
  }),
  {
    getBusinesses
  }
)(BusinessList);
