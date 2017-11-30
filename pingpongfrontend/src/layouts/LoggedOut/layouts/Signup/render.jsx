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
    password: passwordError
  },
  isLoading
}) => {

  const handleSubmit = e => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    handleSignup({name, email, password});
  }

  const getErrorObject = code => {
    switch (code) {
      case 'required':
        return {
          status: 'danger',
          text: 'required'
        }
      case 'invalidEmail':
        return {
          status: 'danger',
          text: 'invalid'
        }
      default:
        return {
          status: 'danger',
          text: 'unknown error'
        }
    }
  }

  return (
    <div>
      <Title>Create an account</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          label='name'
          type='text'
          name='name'
          status={nameError && getErrorObject(nameError).status}
          notice={nameError && getErrorObject(nameError).text}
        />
        <Input
          label='email'
          type='email'
          name='email'
          status={emailError && getErrorObject(emailError).status}
          notice={emailError && getErrorObject(emailError).text}
        />
        <Input
          label='password'
          type='password'
          name='password'
          status={passwordError && getErrorObject(passwordError).status}
          notice={passwordError && getErrorObject(passwordError).text}
        />
        <Button
          style={{marginTop: '1em'}}
          loading={isLoading}
        >
          Create account
        </Button>
      </Form>
      <SecondaryButton style={{marginTop: '1.5em'}}>
        <Link to='/'>sign in to existing account</Link>
      </SecondaryButton>
    </div>
  )
}

export default SignupRender;