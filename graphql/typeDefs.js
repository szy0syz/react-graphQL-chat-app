const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    imageUrl: String
  }

  type Query {
    getUsers: [User]!
  }

  type Mutation {
    register(username: String!, email: String!, password: String!, confirmPassword: String!): User!
  }
`;
