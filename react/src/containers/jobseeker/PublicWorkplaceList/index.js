// import React from 'react';
// import { connect } from 'react-redux';

// import { findPublicJob } from 'redux/jobseeker/find';
// import * as helper from 'utils/helper';

// import { Button } from 'antd';

// import { Loading, AlertMsg, PublicJobDetails } from 'components';

// class JSPublicWorkplaceList extends React.Component {
//   state = {
//     job: null
//   };

//   componentWillMount() {
//     this.props.findPublicJob({ jobId: this.props.match.params.locationId });
//   }

//   componentWillReceiveProps({ jobs }) {
//     if (jobs) {
//       this.setState({
//         job: jobs[0]
//       });
//     }
//   }

//   renderComponent() {
//     if (this.props.error) {
//       return (
//         <AlertMsg>
//           <span>Server Error!</span>
//         </AlertMsg>
//       );
//     }
//     if (this.state.job) {
//       return (
//         <PublicJobDetails
//           job={this.state.job}
//           className="publicJobContainer"
//           roughLocation
//           actions={[
//             <Button
//               type="primary"
//               key="1"
//               onClick={() => {
//                 this.props.history.push(`/auth?redirect=${this.props.location.pathname}`);
//               }}
//             >
//               Sign in
//             </Button>,
//             <Button
//               type="primary"
//               key="2"
//               onClick={() => {
//                 this.props.history.push(`/auth/register`);
//               }}
//             >
//               Register
//             </Button>
//           ]}
//         />
//       );
//     } else {
//       return <Loading size="large" />;
//     }
//   }

//   render() {
//     return <div className="container">{this.renderComponent()}</div>;
//   }
// }

// export default connect(
//   state => {
//     const { jobs, error: error1 } = state.js_find;
//     // const job = jobs[0];
//     return {
//       jobs,
//       error: error1
//     };
//   },
//   {
//     findPublicJob
//   }
// )(JSPublicWorkplaceList);

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Truncate from 'react-truncate';
import { Breadcrumb, List, Avatar, Tooltip, Modal, Input } from 'antd';
import styled from 'styled-components';

// import { getApplications } from 'redux/applications';
import { findPublicJobListing } from 'redux/jobseeker/find';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import * as _ from 'lodash';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons } from 'components';
import Mark from './Mark';
import Wrapper from './styled';

const StyledModal = styled(Modal)`
  .ant-input-group-addon {
    cursor: pointer;
  }

  .ant-form-explain {
    margin-top: 8px;
  }
`;

class JSPublicWorkplaceList extends React.Component {
  state = {
    selectedJob: null,
    showDialog: false,
    selected: '',
    countList: null
  };

  componentDidMount() {
    this.props.findPublicJobListing({ locationId: this.props.match.params.locationId });
  }

  renderJob = job => {
    const { id, status, title, description, loading } = job;
    const logo = helper.getJobLogo(job);
    const closed = status === 2 ? 'disabled' : '';

    return (
      <List.Item key={id} onClick={() => this.selectJob(job)} className={`${loading ? 'loading' : ''} ${closed}`}>
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={title}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {description}
            </Truncate>
          }
        />
        {closed && <Mark>Inactive</Mark>}
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return <AlertMsg>No Job</AlertMsg>;
  };

  render() {
    const { jobs } = this.props;

    return (
      <Wrapper className="container">
        <Helmet title="Jobs" />

        <PageHeader>
          <h2>Jobs</h2>
        </PageHeader>

        <div className="content">
          {jobs === null ? (
            <Loading className="mask" size="large" />
          ) : (
            <ListEx
              data={jobs}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              renderItem={this.renderJob}
              emptyRender={this.renderEmpty}
            />
          )}
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const { publicJobList } = state.js_find;
    return {
      jobs: publicJobList
    };
  },
  {
    findPublicJobListing
  }
)(JSPublicWorkplaceList);
