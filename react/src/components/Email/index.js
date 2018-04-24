import React from 'react';
import styled from 'styled-components';
import { Modal, Form, Input, Button } from 'antd';

const Wrapper = styled(Modal)`
  width: 648px !important;

  .ant-modal-body {
    position: relative;

    button + button {
      margin-left: 15px;
    }

    .ant-form-item:last-child {
      margin-bottom: 0;
    }
  }
`;

const Item = Form.Item;
const { TextArea } = Input;

class Email extends React.Component {
  send = () => {
    this.props.onClose();
  };

  render() {
    const { to, onClose, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Wrapper title="Email" visible maskClosable={false} footer={null} onCancel={() => onClose()}>
        <Form>
          <Item label={null} layout="inline">
            {getFieldDecorator('email', {
              initialValue: to,
              rules: [
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!'
                },
                {
                  required: true,
                  message: 'Please input your E-mail!'
                }
              ]
            })(<Input disabled />)}
          </Item>
          <Item label={null}>
            {getFieldDecorator('description', {
              rules: [
                { required: true, message: 'Please enter description!' },
                { whitespace: true, message: 'This field may not be blank.' }
              ]
            })(<TextArea autosize={{ minRows: 3, maxRows: 20 }} />)}
          </Item>

          <Item label={null}>
            <Button type="primary" onClick={this.send}>
              Send
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </Item>
        </Form>
      </Wrapper>
    );
  }
}

export default Form.create()(Email);
