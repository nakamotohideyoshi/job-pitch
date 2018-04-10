import React from 'react';
import { Button } from 'antd';

import { JobDetail } from 'components';
import StyledModal from './styled';

export default ({ job, onApply, onRemove, onMessage, onClose }) => {
  return (
    <StyledModal visible footer={null} className="container" title="Job Details" onCancel={onClose}>
      <div className="content">
        <JobDetail className="job-detail" job={job} />

        <div className="buttons">
          {onApply && (
            <Button type="primary" loading={job.loading} onClick={onApply}>
              Apply
            </Button>
          )}

          {onRemove && (
            <Button type="danger" disabled={job.loading} onClick={onRemove}>
              Remove
            </Button>
          )}

          {onMessage && (
            <Button type="primary" onClick={onMessage}>
              Message
            </Button>
          )}
        </div>
      </div>
    </StyledModal>
  );
};
