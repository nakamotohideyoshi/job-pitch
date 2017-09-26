import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import ReactSuperSelect from 'react-super-select';
import FormControl from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Collapse from 'react-bootstrap/lib/Collapse';
import Button from 'react-bootstrap/lib/Button';
import EXIF from 'exif-js';
import { CheckBox } from 'components';

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
  };

  getError = (name) => {
    const { errors } = this.state;
    if (!errors) return null;
    if (!name) {
      if (errors.non_field_errors) {
        return errors.non_field_errors.join(', ');
      }
      return null;
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

  HelpField = ({ label }) => (
    <Collapse in={!!label}>
      <HelpBlock>{label}</HelpBlock>
    </Collapse>
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
      <div className={error && 'has-error'}>
        <FormControl
          {...props}
          value={formModel[name] || ''}
          onChange={handleChange}
        />
        <this.HelpField label={error} />
      </div>
    );
  }

  SelectField = ({ name, dataSource, multiple, onChange, ...props }) => {
    const { formModel } = this.state;
    const handleChange = options => {
      const callback = onChange || this.onChangedModel;
      callback(name, options);
    };
    const error = this.getError(name);
    return (
      <div className={`sm-select ${error ? 'has-error' : ''}`}>
        <ReactSuperSelect
          {...props}
          dataSource={dataSource || []}
          initialValue={formModel[name]}
          multiple={multiple}
          keepOpenOnSelection={multiple}
          onChange={options => { handleChange(options); }}
          noResultsString=""
        />
        <this.HelpField label={error} />
      </div>
    );
  }

  ImageField = ({ name }) => {
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
    };
    const onRemove = () => onChange();

    const image = this.state[name] || {};
    return (
      <div className="image-uploader">
        <Dropzone
          accept="image/jpeg, image/png"
          multiple={false}
          onDrop={onChange}
        >
          <div
            className={`logo exif_${image.orientation || 1}`}
            style={{ backgroundImage: `url(${image.url})` }}
          />
        </Dropzone>
        {
          image.exist && <button className="btn-icon" onClick={onRemove}>Remove Logo</button>
        }
      </div>
    );
  }

  SubmitButton = ({ submtting, labels, ...props }) => {
    const error = this.getError();
    return (
      <div className={error ? 'has-error' : null}>
        <this.HelpField label={error} />
        <Button
          type="button"
          bsStyle="success"
          disabled={submtting}
          {...props}
        >{submtting ? labels[1] : labels[0]}</Button>
      </div>
    );
  }

}
