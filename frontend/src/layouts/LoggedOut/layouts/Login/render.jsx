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
  handleSignin,
  validationObject: {
    name: nameError,
    email: emailError,
    password: passwordError
  },
  isLoading
}) => {

  const handleSubmit = e => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    handleSignin({ email, password });
  }

  const getErrorObject = code => {
    switch (code) {
      case 'required':
        return {
          status: 'danger',
          text: 'required'
        }
      case 'wrong':
        return {
          status: 'danger',
          text: 'WROOOONG!'
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
      <Title>Sign in</Title>
      <Form onSubmit={handleSubmit}>
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
          Sign in
        </Button>
      </Form>
      <Link to='/signup'>
        <SecondaryButton style={{marginTop: '1.5em'}}>
          Create a new account
        </SecondaryButton>
      </Link>
    </div>
  )
}

export default SignupRender;
