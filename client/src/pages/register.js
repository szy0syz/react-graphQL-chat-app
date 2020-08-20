import React, { useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";

const REGISTER_USER = gql`
  mutation register(
    $email: String!
    $username: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      email: $email
      username: $username
      password: $password
      confirmPassword: $confirmPassword
    ) {
      email
      username
      createdAt
    }
  }
`;

export default () => {
  const [variables, setVariables] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, res) {
      console.log(res);
    },
    onError(err) {
      console.log(err);
      setErrors(err.graphQLErrors[0].extensions.errors)
    }
  });

  function submitRegisterForm(e) {
    e.preventDefault();

    registerUser(variables);
  }

  return (
    <Row className="bg-white py-5 justify-content-center">
      <Col sm={8} md={6} lg={4}>
        <h1 className="text-center">Register</h1>
        <Form onSubmit={submitRegisterForm}>
          <Form.Group>
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              value={variables.email}
              onChange={(e) => setVariables({ ...variables, email: e.target.value })}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={variables.username}
              onChange={(e) => setVariables({ ...variables, username: e.target.value })}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={variables.password}
              onChange={(e) => setVariables({ ...variables, password: e.target.value })}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Confirm password</Form.Label>
            <Form.Control
              type="password"
              value={variables.confirmPassword}
              onChange={(e) => setVariables({ ...variables, confirmPassword: e.target.value })}
            />
          </Form.Group>

          <div className="text-center">
            <Button variant="success" type="submit">
              Register
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
};
