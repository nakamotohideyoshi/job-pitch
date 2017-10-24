import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import { scroller } from 'react-scroll';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Collapse from 'react-bootstrap/lib/Collapse';
import Button from 'react-bootstrap/lib/Button';
import Textarea from 'react-textarea-autosize';
import EXIF from 'exif-js';
import { CheckBox } from 'components';
import styles from './FormComponent.scss';

export default class FormComponent extends Component {

  constructor(props, states) {
    super(props);
    this.state = Object.assign({
      formModel: {},
      errors: {},
    }, states);
  }

  onChangedModel = (name, value) => {
    const { formModel, errors } = this.state;
    formModel[name] = value;
    errors[name] = null;
    this.setState({ formModel, errors });
    FormComponent.needToSave = this.state.needToSave;
  };

  getError = name => {
    const { errors } = this.state;
    if (!errors) return null;
    if (!name) {
      if (errors.non_field_errors) {
        return errors.non_field_errors.join(', ');
      }
      return errors.detail;
    }
    const error = errors[name];
    if (typeof error === 'string') return error;
    return error && error.join(', ');
  }

  isValid = names => {
    const { formModel } = this.state;
    let errors;
    names.forEach(item => {
      const value = formModel[item];
      if (!value || (typeof value === 'object' && value.length === 0)) {
        if (!errors) {
          scroller.scrollTo(item, { smooth: true, duration: 100 });
        }
        errors = Object.assign(errors || {}, { [item]: 'Required' });
      }
    });
    this.setState({
      formModel,
      errors: errors || {},
    });
    return !errors;
  }

  loadImage = (image, name) => {
    if (image && image.url) {
      const req = new XMLHttpRequest();
      req.open('GET', image.url, true);
      req.responseType = 'blob';
      req.onload = e => {
        if (e.target.status === 200) {
          EXIF.getData(req.response, () => {
            image.orientation = EXIF.getTag(req.response, 'Orientation') || 1;
            this.setState({ [name]: image });
          });
        }
      };
      req.send();
    }
  }

  ErrorContainer = ({ error, children }) => (
    <div className={error && 'has-error'}>
      {children}
      <Collapse in={!!error}>
        <HelpBlock>{error}</HelpBlock>
      </Collapse>
    </div>
  );

  CheckBoxField = ({ name, onChange, label, ...props }) => {
    const { formModel } = this.state;
    const handleChange = e => {
      const callback = onChange || this.onChangedModel;
      callback(name, e.target.checked);
    };
    return (
      <CheckBox
        {...props}
        onChange={handleChange}
        checked={!!formModel[name]}
      >{label}</CheckBox>
    );
  }

  TextField = ({ name, onChange, ...props }) => {
    const { formModel } = this.state;
    const handleChange = e => {
      const callback = onChange || this.onChangedModel;
      callback(name, e.target.value);
    };
    const error = this.getError(name);
    return (
      <this.ErrorContainer error={error}>
        <FormControl
          {...props}
          value={formModel[name] || ''}
          onChange={handleChange}
        />
      </this.ErrorContainer>
    );
  }

  TextAreaField = ({ name, onChange, maxLength, ...props }) => {
    const { formModel } = this.state;
    const handleChange = e => {
      const callback = onChange || this.onChangedModel;
      callback(name, e.target.value);
    };
    const error = this.getError(name);
    return (
      <this.ErrorContainer error={error}>
        <Textarea
          {...props}
          maxLength={maxLength}
          value={formModel[name] || ''}
          onChange={handleChange}
        />
        {
          maxLength &&
          <div className="textareaLength">
            {parseInt(maxLength, 10) - (this.state.formModel.description || '').length} characters left
          </div>
        }
      </this.ErrorContainer>
    );
  }

  SelectField = ({ name, onChange, ...props }) => {
    const { formModel } = this.state;
    const handleChange = item => {
      const callback = onChange || this.onChangedModel;
      callback(name, item);
    };
    const error = this.getError(name);
    return (
      <this.ErrorContainer error={error}>
        <Select
          {...props}
          valueKey="id"
          labelKey="name"
          value={formModel[name]}
          onChange={item => { handleChange(item); }}
        />
      </this.ErrorContainer>
    );
  }

  ImageField = ({ name }) => {
    let dropzoneRef;

    const onChange = files => {
      const image = this.state[name] || {};
      image.file = files && files[0];
      image.exist = !!image.file;
      if (image.exist) {
        image.url = image.file.preview;
        image.orientation = 1;
        EXIF.getData(image.file, () => {
          image.orientation = EXIF.getTag(image.file, 'Orientation') || 1;
          this.setState({ [name]: image });
        });
      } else {
        image.url = image.default;
        image.orientation = undefined;
      }
      this.setState({ [name]: image });
      FormComponent.needToSave = this.state.needToSave;
    };

    const onRemove = event => {
      onChange();
      event.preventDefault();
    };

    const onOpen = event => {
      dropzoneRef.open();
      event.preventDefault();
    };

    const image = this.state[name] || {};

    return (
      <div className={styles.imageUploader}>
        <Dropzone
          accept="image/jpeg, image/png"
          multiple={false}
          ref={node => { dropzoneRef = node; }}
          onDrop={onChange}
        >
          <div
            className={`logo exif_${image.orientation || 1}`}
            style={{ backgroundImage: `url(${image.url})` }}
          />
        </Dropzone>
        {
          image.exist ?
            <button className="link-btn" onClick={onRemove}>Remove Logo</button>
          :
            <button className="link-btn" onClick={onOpen}>Add Logo</button>
        }
      </div>
    );
  }

  SubmitButton = ({ submtting, labels, ...props }) => {
    const error = this.getError();
    return (
      <this.ErrorContainer error={error}>
        <Button
          type="button"
          bsStyle="success"
          disabled={submtting}
          {...props}
        >{submtting ? labels[1] : labels[0]}</Button>
      </this.ErrorContainer>
    );
  }

  SubmitButtonWithCancel = ({ submtting, labels, cancelLabel, onCancel, ...props }) => {
    const error = this.getError();
    return (
      <this.ErrorContainer error={error}>
        <Button
          type="button"
          bsStyle="success"
          disabled={submtting}
          {...props}
        >{submtting ? labels[1] : labels[0]}</Button>
        <Button
          onClick={onCancel}
          disabled={submtting}
        >{cancelLabel}</Button>
      </this.ErrorContainer>
    );
  }

}
