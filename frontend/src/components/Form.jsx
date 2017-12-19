import React from 'react';
import glamorous from 'glamorous';

const StyledForm = glamorous.form({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 600
});

const Form = ({
  children,
  onSubmit
}) => {
  return (
    <StyledForm onSubmit={onSubmit} noValidate>
      {children}
    </StyledForm>
  );
}

export default Form;
