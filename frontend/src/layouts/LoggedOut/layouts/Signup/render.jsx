import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import Form from 'components/Form';
import Input from 'components/Input';
import Button from 'components/Button';
import SecondaryButton from 'components/SecondaryButton';

const Title = glamorous.h1({
  textAlign: 'center'
});

const SignupRender = ({
  handleSignup,
  validationObject: {
    name: nameError,
    email: emailError,
    alias: aliasError,
    password: passwordError,
    errorMessage
  },
  isLoading
}) => {
  const handleSubmit = e => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const alias = e.target.alias.value;
    const password = e.target.password.value;
    handleSignup({ name, email, alias, password });
  };

  const getErrorObject = code => {
    switch (code) {
      case 'required':
        return {
          status: 'danger',
          text: 'required'
        };
      case 'invalidEmail':
        return {
          status: 'danger',
          text: 'invalid'
        };
      default:
        return {
          status: 'danger',
          text: 'unknown error'
        };
    }
  };

  const getErrorMessage = error => {
    switch (error) {
      case 'emailInUse':
        return 'Email already a member';
      case 'aliasInUse':
        return 'Alias is already in use';
      case 'unknown':
        return 'Unknown error';
      default:
        return null;
    }
  };

  return (
    <div>
      <Title>Create an account</Title>
      <Form
        onSubmit={handleSubmit}
        errorMessage={getErrorMessage(errorMessage)}
      >
        <Input
          label="name"
          type="text"
          name="name"
          status={nameError && getErrorObject(nameError).status}
          notice={nameError && getErrorObject(nameError).text}
        />
        <Input
          label="email"
          type="email"
          name="email"
          status={emailError && getErrorObject(emailError).status}
          notice={emailError && getErrorObject(emailError).text}
        />
        <Input
          label="alias"
          type="alias"
          name="alias"
          status={aliasError && getErrorObject(aliasError).status}
          notice={aliasError && getErrorObject(aliasError).text}
        />
        <Input
          label="password"
          type="password"
          name="password"
          status={passwordError && getErrorObject(passwordError).status}
          notice={passwordError && getErrorObject(passwordError).text}
        />
        <Button style={{ marginTop: '1em' }} loading={isLoading}>
          Create account
        </Button>
      </Form>
      <Link to="/">
        <SecondaryButton style={{ marginTop: '1.5em' }}>
          sign in to existing account
        </SecondaryButton>
      </Link>
    </div>
  );
};

export default SignupRender;
