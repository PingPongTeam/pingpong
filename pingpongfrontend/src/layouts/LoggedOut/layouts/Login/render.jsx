import React from 'react';
import glamorous from 'glamorous';

const StyledForm = glamorous.form({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 600
});

const LoginRender = () => {
  return (
    <div>
      <StyledForm>
        <h1>LOGGA IN DÅ DUMJÄVEL</h1>
        <input type="text" />
      </StyledForm>
    </div>
  );
}

export default LoginRender;
