import React from "react";
import { Link } from "react-router-dom";
import glamorous from "glamorous";
import Form from "components/Form";
import Input from "components/Input";
import Button from "components/Button";
import SecondaryButton from "components/SecondaryButton";

const Dashboard = () => {
  return (
    <div>
      <h1>INLOGGAD !</h1>
      <Link to="/match/new">
        <Button>Starta en matchjävel då</Button>
      </Link>
    </div>
  );
};

export default Dashboard;
