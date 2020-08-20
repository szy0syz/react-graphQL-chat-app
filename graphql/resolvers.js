const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { UserInputError, AuthenticationError } = require("apollo-server");

const { User } = require("../models");
const { JWT_SECRET } = require("../config/env.json");

module.exports = {
  Query: {
    getUsers: async (_, __, context) => {
      try {
        let user;
        if (context.req && context.req.headers.authorization) {
          const token = context.req.headers.authorization.split(" ")[1];
          jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) throw new AuthenticationError("Unauthorization");
            user = decodedToken;
          });
        } else {
          throw new AuthenticationError("Unauthorization");
        }

        const users = await User.findAll({
          where: { username: { [Op.ne]: user.username } },
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // login: async (parent, args) => {
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};

      try {
        if (username.trim() === "") errors.username = "username must not be empty";
        if (password === "") errors.password = "password must not be empty";

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("bad input", { errors });
        }

        const user = await User.findOne({
          where: { username },
        });

        if (!user) {
          errors.username = "user not found";
          throw new UserInputError("user not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
          errors.password = "password is incorrect";
          throw new AuthenticationError("password is incorrect", { errors });
        }

        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: 60 * 60 });

        return {
          ...user.toJSON(),
          token,
          createdAt: user.createdAt.toISOString(),
        };
      } catch (err) {
        console.error(err);
        throw err;
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
        console.log("\n[error]: ", err);
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach((e) => (errors[e.path] = `${e.path} is already taken`));
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        console.log(errors);
        console.log(err);
        throw new UserInputError("Bad input", { errors: err });
      }
    },
  },
};

/*
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImplcnJ5MSIsImlhdCI6MTU5NzM3MjcwMSwiZXhwIjoxNTk3Mzc2MzAxfQ.suUNyCbkrGq5XN1z9FA1Pm06rkPVCtNi4CTMyC31gKM"
}
*/
