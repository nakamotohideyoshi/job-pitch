import React from 'react';
import { Input, FormFeedback } from 'reactstrap';
import Scroll, { scroller } from 'react-scroll';
import Select from 'react-select';
import Textarea from 'react-textarea-autosize';
import Dropzone from 'react-dropzone';

import { Checkbox, Logo } from 'components';
import { LogoWrapper } from './Wrapper';

export default class FormComponent extends React.Component {
  state = {
    model: {},
    errors: {}
  };

  inputs = {};

  modifyFlag = false;

  componentWillReceiveProps(nextProps) {
    if (!this.props.errors && nextProps.errors) {
      const { errors } = nextProps;
      this.setState({ errors });

      // for (let key in errors) {
      //   if (this.inputs[key]) {
      //     this.inputs[key].focus();
      //     return;
      //   }
      // }
    }
  }

  isValid = names => {
    const { model, errors } = this.state;
    let error = false;

    names.forEach(name => {
      const value = model[name];
      if (!value || (typeof value === 'object' && value.length === 0)) {
        if (!error) {
          error = true;
          if (this.inputs[name]) {
            this.inputs[name].focus();
          }
          scroller.scrollTo(name, { smooth: true, duration: 100, offset: -85 });
        }
        errors[name] = 'This field is required.';
      }
    });

    this.setState({ errors });

    return !error;
  };

  getError = name => {
    if (!name) {
      return this.getError('non_field_errors') || this.getError('message');
    }

    const error = this.state.errors[name];
    if (typeof error === 'string') return error;
    return error && error.join(', ');
  };

  changeModel = (name, value) => {
    const { model, errors } = this.state;
    model[name] = value;
    delete errors[name];
    this.setState({ model });
    FormComponent.modified = this.modifyFlag;
  };

  /**
  |--------------------------------------------------
  | checkbox
  |--------------------------------------------------
  */

  FormCheckbox = ({ name, ...rest }) => {
    return (
      <Scroll.Element name={name}>
        <Checkbox
          {...rest}
          name={name}
          checked={this.state.model[name]}
          onChange={e => this.changeModel(name, e.target.checked)}
        />
      </Scroll.Element>
    );
  };

  /**
  |--------------------------------------------------
  | input
  |--------------------------------------------------
  */

  FormInput = ({ name, innerRef, className, ...rest }) => {
    const error = this.getError(name);
    return (
      <Scroll.Element name={name} className={className}>
        <Input
          name={name}
          value={this.state.model[name] || ''}
          valid={error ? false : null}
          innerRef={ref => {
            this.inputs[name] = ref;
          }}
          onChange={e => this.changeModel(name, e.target.value)}
          {...rest}
        />
        {error && <FormFeedback>{error}</FormFeedback>}
      </Scroll.Element>
    );
  };

  /**
  |--------------------------------------------------
  | textarea
  |--------------------------------------------------
  */

  FormTextArea = ({ name, maxLength, ...rest }) => {
    const error = this.getError(name);
    return (
      <Scroll.Element name={name}>
        <Textarea
          {...rest}
          maxLength={maxLength}
          value={this.state.model[name]}
          onChange={e => this.changeModel(name, e.target.value)}
          className={error ? 'is-invalid' : ''}
        />
        {error && <FormFeedback>{error}</FormFeedback>}
      </Scroll.Element>
    );
  };

  /**
  |--------------------------------------------------
  | select
  |--------------------------------------------------
  */

  FormSelect = ({ name, ...rest }) => {
    const error = this.getError(name);
    return (
      <Scroll.Element name={name}>
        <Select
          {...rest}
          valueKey="id"
          labelKey="name"
          value={this.state.model[name]}
          onChange={item => {
            if (Array.isArray(item)) {
              this.changeModel(name, (item || []).map(item => item.id));
            } else {
              this.changeModel(name, (item || {}).id);
            }
          }}
          className={error ? 'is-invalid' : ''}
        />
        {error && <FormFeedback>{error}</FormFeedback>}
      </Scroll.Element>
    );
  };

  /**
  |--------------------------------------------------
  | logo select
  |--------------------------------------------------
  */

  FormLogoSelect = () => {
    let dropzoneRef;

    const onOpen = () => {
      dropzoneRef.open();
    };

    const onRemove = () => {
      onSelect();
    };

    const onSelect = files => {
      const { logo } = this.state;
      logo.file = files && files[0];
      logo.exist = !!logo.file;
      if (logo.exist) {
        logo.url = logo.file.preview;
      } else {
        logo.url = logo.default;
      }

      this.setState({ logo });
      FormComponent.modified = this.modifyFlag;
    };

    const logo = this.state.logo || {};

    return (
      <LogoWrapper>
        <Logo className="logo-img" src={logo.url} onClick={onOpen} />
        {logo.exist ? <a onClick={onRemove}>Remove Logo</a> : <a onClick={onOpen}>Add Logo</a>}
        <Dropzone
          accept="image/jpeg, image/png"
          multiple={false}
          className="dropzone"
          onDrop={onSelect}
          ref={ref => {
            dropzoneRef = ref;
          }}
        />
      </LogoWrapper>
    );
  };
}

export class SaveFormComponent extends FormComponent {
  constructor(props) {
    super(props);
    this.modifyFlag = true;
  }
}
