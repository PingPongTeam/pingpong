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
      alias: null,
      password: null,
      errorMessage: null
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

  async handleSignup({name: rawName, email: rawEmail, alias: rawAlias, password: rawPassword}) {
    console.log('wat')
    this.setState(() => ({validationObject: this.defaultValidationObject}));
    const name = rawName.trim();
    const email = rawEmail.trim();
    const alias = rawAlias.trim();
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
    if(alias.length < 1) {
      this.setValidationState('alias', 'required');
      passesValidation = false;
    }
    if(password.length < 1) {
      this.setValidationState('password', 'required');
      passesValidation = false;
    }
    if(passesValidation === false) { return; }
    this.setState(() => ({isLoading: true}));
    try {
      await user.create({ name, email, alias, password });
    } catch (errors) {
      console.log('got errors', errors);
      errors.forEach(error => {
        if (error.error === 'ValueInUse') {
          if (error.hint === 'email') {
            this.setValidationState('errorMessage', 'emailInUse');
          } else if (error.hint === 'alias') {
            this.setValidationState('errorMessage', 'aliasInUse');
          }
        }
      });
    }
    this.setState(() => ({isLoading: false}));
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
