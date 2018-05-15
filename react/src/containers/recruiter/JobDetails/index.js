import React from 'react';

import * as helper from 'utils/helper';

import { JobDetails } from 'components';
import StyledModal from './styled';

class JSJobDetails extends React.Component {
  render() {
    const { job, onClose } = this.props;

    return (
      <StyledModal visible footer={null} className="container" title="Job Details" onCancel={onClose}>
        <div className="content">
          <JobDetails className="job-detail" job={job} />
        </div>
      </StyledModal>
    );
  }
}

export default JSJobDetails;
