import React from 'react';
import Form from 'components/Form';
import Input from 'components/Input';
import Button from 'components/Button';

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
      <h1>Create an account</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          label='Name'
          type='text'
          name='name'
          status={nameError && getErrorObject(nameError).status}
          notice={nameError && getErrorObject(nameError).text}
        />
        <Input
          label='Email'
          type='email'
          name='email'
          status={emailError && getErrorObject(emailError).status}
          notice={emailError && getErrorObject(emailError).text}
        />
        <Input
          label='Password'
          type='password'
          name='password'
          status={passwordError && getErrorObject(passwordError).status}
          notice={passwordError && getErrorObject(passwordError).text}
        />
        <Button
          loading={isLoading}
        >
          Create account
        </Button>
      </Form>
    </div>
  )
}

export default SignupRender;