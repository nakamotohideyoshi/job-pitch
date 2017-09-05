import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import ReactSuperSelect from 'react-super-select';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Button from 'react-bootstrap/lib/Button';
import EXIF from 'exif-js';

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

  HelpField = ({ label }) => (
    <Collapse in={!!label}>
      <HelpBlock>{label}</HelpBlock>
    </Collapse>
  );

  CheckBox = ({ name, onChange, checkLabel, ...props }) => {
    const { formModel } = this.state;
    const handleChange = e => {
      const callback = onChange || this.onChangedModel;
      callback(name, e.target.checked);
    };
    return (
      <Checkbox
        {...props}
        onChange={handleChange}
        checked={!!formModel[name]}
      >{checkLabel}</Checkbox>
    );
  }

  CheckBoxGroup = ({ label, ...props }) => (
    <FormGroup>
      <Col componentClass={ControlLabel} sm={2}>{label}</Col>
      <Col sm={10}>
        <this.CheckBox {...props} />
      </Col>
    </FormGroup>
  );

  TextField = ({ name, onChange, ...props }) => {
    const { formModel } = this.state;
    const handleChange = e => {
      const callback = onChange || this.onChangedModel;
      callback(name, e.target.value);
    };
    const onKeyUp = e => {
      // e.target.style.height = e.target.scrollHeight + 'px';
    };
    const error = this.getError(name);
    return (
      <div className={error && 'has-error'}>
        <FormControl
          {...props}
          value={formModel[name] || ''}
          onChange={handleChange}
          onKeyUp={onKeyUp}
        />
        <this.HelpField label={error} />
      </div>
    );
  }

  TextFieldGroup = ({ label, help, ...props }) => (
    <FormGroup>
      <Col componentClass={ControlLabel} sm={2}>{label}</Col>
      <Col sm={10}>
        { help && <HelpBlock>{help}</HelpBlock> }
        <this.TextField {...props} />
      </Col>
    </FormGroup>
  );

  TextFieldCheckGroup = ({ label, checkName, checkLabel, onCheckChange, ...props }) => (
    <FormGroup>
      <Col componentClass={ControlLabel} sm={2}>{label}</Col>
      <Col sm={8}>
        <this.TextField {...props} />
      </Col>
      <Col sm={2}>
        <this.CheckBox
          name={checkName}
          checkLabel={checkLabel}
          onChange={onCheckChange}
        />
      </Col>
    </FormGroup>
  );

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

  SelectFieldGroup = ({ label, ...props }) => (
    <FormGroup>
      <Col componentClass={ControlLabel} sm={2}>{label}</Col>
      <Col sm={10}>
        <this.SelectField {...props} />
      </Col>
    </FormGroup>
  );

  SelectFieldCheckGroup = ({ label, ...props }) => (
    <FormGroup>
      <Col componentClass={ControlLabel} sm={2}>{label}</Col>
      <Col sm={10}>
        <this.SelectField {...props} />
      </Col>
    </FormGroup>
  );

  ImageFieldGroup = ({ label, name }) => {
    let dropzoneRef;
    const onOpen = () => dropzoneRef.open();
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
    if (image && image.url && image.orientation === undefined) {
      image.orientation = 1;
      this.setState({ [name]: image });

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
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} sm={2}>{label}</Col>
        <Col sm={10} className="logo-selector">
          <Dropzone
            ref={node => { dropzoneRef = node; }}
            accept="image/jpeg, image/png"
            multiple={false}
            onDrop={onChange}
          >
            <div
              className={`logo exif_${image.orientation}`}
              style={{ backgroundImage: `url(${image.url})` }}
            />
          </Dropzone>
          <Button onClick={onOpen}>{image.exist ? 'Change' : 'Add'}</Button><br />
          {
            image.exist && (<Button onClick={onRemove}>Remove</Button>)
          }
        </Col>
      </FormGroup>
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

  SubmitButtonGroup = ({ ...props }) => (
    <FormGroup>
      <Col smOffset={2} sm={10}>
        <this.SubmitButton {...props} />
      </Col>
    </FormGroup>
  );

  SubmitCancelButtons = ({ cancelLabel, onCancel, submtting, labels, ...props }) => {
    const error = this.getError();
    return (
      <div className={error ? 'has-error' : null}>
        <this.HelpField label={error} />
        <Button
          type="button"
          onClick={onCancel}
          disabled={submtting}
        >{cancelLabel}</Button>
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
