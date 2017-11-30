import { Component } from 'react';
import { socket } from 'services/api';
import { user } from 'services/api/user';
import emailValidator from 'email-validator';
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
    socket.on('user:signup', (message) => {
      console.log('user:signup response from backend', message)
    });
  }

  setValidationState(input, statusCode) {
    this.setState((prevState) => ({
      validationObject: {...prevState.validationObject, [input]: statusCode}
    }));
  }

  handleSignup({name: rawName, email: rawEmail, password: rawPassword}) {
    console.log('wat')
    this.setState(() => ({validationObject: this.defaultValidationObject}));
    const name = rawName.trim();
    const email = rawEmail.trim();
    const password = rawPassword.trim();
    let passesValidation = true;
    if(name.length < 1) {
      this.setValidationState('name', 'required');
      passesValidation = false;
    }
    if(email.length < 1) {
      this.setValidationState('email', 'required');
      passesValidation = false;
    } else if(!emailValidator.validate(email)) {
      this.setValidationState('email', 'invalidEmail');
      passesValidation = false;
    }
    if(password.length < 1) {
      this.setValidationState('password', 'required');
      passesValidation = false;
    }
    if(passesValidation === false) { return; }
    this.setState(() => ({isLoading: true}));
    user.signup({name, email, password});
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
