import React from 'react';
import { Link } from 'react-router-dom';
import glamorous from 'glamorous';
import Form from 'components/Form';
import Input from 'components/Input';
import Button from 'components/Button';
import SecondaryButton from 'components/SecondaryButton';

const Wrapper = glamorous.div({
  width: '100%'
});
const StarMatch = glamorous.div({
  position: 'fixed',
  bottom: 0,
  width: '100%'
});

const Dashboard = () => {
  return (
    <Wrapper>
      <StarMatch>
        <Link to="/match/new">
          <Button>Start new game</Button>
        </Link>
      </StarMatch>
    </Wrapper>
  );
};

export default Dashboard;
