import React from 'react';
import glamorous from 'glamorous';
import globalStyles from 'globalStyles';

const StyledForm = glamorous.form({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 600
});
const ErrorMessage = glamorous.span({
  backgroundColor: `rgb(${globalStyles.colors.danger})`,
  textAlign: 'center',
  padding: '5px 15px',
  color: 'white',
  borderRadius: globalStyles.borderRadius,
});

const Form = ({
  children,
  onSubmit,
  errorMessage = null
}) => {
  return (
    <StyledForm onSubmit={onSubmit} noValidate>
      {errorMessage && (<ErrorMessage>{errorMessage}</ErrorMessage>)}
      {children}
    </StyledForm>
  );
}

export default Form;
