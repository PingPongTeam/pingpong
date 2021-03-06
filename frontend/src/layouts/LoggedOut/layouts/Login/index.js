import { Component } from 'react';
import Render from './render';
import { socket } from 'services/api';
import { user } from 'services/api/user';

class LoginContainer extends Component {
  constructor() {
    super();
    this.handleSignin = this.handleSignin.bind(this);
    this.setValidationState = this.setValidationState.bind(this);
    this.defaultValidationObject = {
      email: null,
      password: null,
      errorMessage: null
    };
    this.state = {
      isLoading: false,
      validationObject: this.defaultValidationObject
    };
    socket.on('user:signin', message => {
      console.log('user:signup response from backend', message);
    });
  }

  setValidationState(input, statusCode) {
    this.setState(prevState => ({
      validationObject: { ...prevState.validationObject, [input]: statusCode }
    }));
  }

  async handleSignin({ email, password }) {
    if (this.state.isLoading === true) {
      return;
    }
    this.setState(() => ({ validationObject: this.defaultValidationObject }));
    let passesValidation = true;
    if (email.length < 1) {
      this.setValidationState('email', 'required');
      passesValidation = false;
    }
    if (password.length < 1) {
      this.setValidationState('password', 'required');
      passesValidation = false;
    }
    if (passesValidation === false) {
      return;
    }
    this.setState(() => ({ isLoading: true }));
    try {
      await user.loginEmailOrAliasPass({ auth: email, password });
    } catch (errorResponse) {
      if (errorResponse.errors[0].error) {
        switch (errorResponse.errors[0].error) {
          case 'InvalidUser':
            this.setValidationState('errorMessage', 'invalidUser');
            break;
          default:
            this.setValidationState('errorMessage', 'unknown');
            break;
        }
      }
    }
    this.setState(() => ({ isLoading: false }));
  }

  render() {
    return Render({
      handleSignin: this.handleSignin,
      validationObject: this.state.validationObject,
      isLoading: this.state.isLoading
    });
  }
}

export default LoginContainer;
