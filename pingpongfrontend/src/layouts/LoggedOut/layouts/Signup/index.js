import { Component } from 'react';
import { signup } from 'services/api/signup';
import Render from './render';

class SignupContainer extends Component {

  constructor() {
    super();
    this.handleSignup = this.handleSignup.bind(this);
    this.setValidationState = this.setValidationState.bind(this);
    this.defaultValidationObject = {
      name: null,
      email: null,
      password: null,
    }
    this.state = {
      isLoading: false,
      validationObject: this.defaultValidationObject
    }
  }

  setValidationState(input, statusCode) {
    this.setState((prevState) => ({
      validationObject: {...prevState.validationObject, [input]: statusCode}
    }));
  }

  handleSignup({name, email, password}) {
    console.log('wat')
    this.setState(() => {validationObject: this.defaultValidationObject});
    let passesValidation = true;
    if(name.trim().length < 1) {
      this.setValidationState('name', 'required');
      passesValidation = false;
    }
    if(email.trim().length < 1) {
      this.setValidationState('email', 'required');
      passesValidation = false;
    }
    if(password.trim().length < 1) {
      this.setValidationState('password', 'required');
      passesValidation = false;
    }
    if(passesValidation === false) { return; }
    this.setState(() => ({isLoading: true}));
    signup({name, email, password});
  }

  render() {
    return Render({
      handleSignup: this.handleSignup,
      validationObject: this.state.validationObject,
      isLoading: this.state.isLoading
    });
  }
};

export default SignupContainer;
