const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");
const { User } = require("../models");

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();

        return users;
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    register: async (_, args, context, info) => {
      let { username, email, password, confirmPassword } = args;
      let errors = [];

      try {
        // validate input data
        if (email.trim() === "") errors.email = "Emial must not bt empty";
        if (username.trim() === "") errors.username = "username must not bt empty";
        if (password.trim() === "") errors.password = "password must not bt empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "confirm password must not bt empty";
        if (password !== confirmPassword) errors.confirmPassword = "password must be match";

        // check if username / email exists
        // const userByUsername = await User.findOne({ where: { username } });
        // const emailByUsername = await User.findOne({ where: { email } });
        // if (userByUsername) errors.username = "Username is taken";
        // if (emailByUsername) errors.email = "Email is taken";

        if (Object.keys(errors).length > 0) throw errors;

        // hash password
        password = await bcrypt.hash(password, 6);
        // create user
        const user = await User.create({ username, email, password });
        // return user
        return user;
      } catch (err) {
        console.log('\n[error]: ', err);
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach((e) => (errors[e.path] = `${e.path} is already taken`));
        } else if (err.name === 'SequelizeValidationError') {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }

        throw new UserInputError("Bad input", { errors: err });
      }
    },
  },
};
