module.exports = {
  Query: {
    getUsers: () => {
      const users = [
        {
          id: 1,
          username: "jerry",
          email: "jerry@123.com",
        },
        {
          id: 2,
          username: "tom",
          email: "tom@123.com",
        },
      ];
      return users;
    },
  },
};
