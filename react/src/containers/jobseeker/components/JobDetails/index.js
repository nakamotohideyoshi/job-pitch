import React from 'react';
import { Button } from 'antd';

import { JobDetails } from 'components';
import StyledModal from './styled';

export default ({ job, onApply, onRemove, onMessage, onClose, roughLocation }) => (
  <StyledModal visible className="container" title="Job Details" footer={null} onCancel={onClose}>
    <div className="content">
      <JobDetails className="details" job={job} roughLocation={roughLocation} />

      <div className="buttons">
        {onApply && (
          <Button type="primary" loading={job.loading} onClick={onApply}>
            Apply
          </Button>
        )}

        {onMessage && (
          <Button type="primary" onClick={onMessage}>
            Message
          </Button>
        )}

        {onRemove && (
          <Button type="danger" disabled={job.loading} onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
    </div>
  </StyledModal>
);
