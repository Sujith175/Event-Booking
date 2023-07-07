const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User Exists already");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });

      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    try {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        throw new Error("User Not Registered with this Email");
      }
      const isEqual = await bcrypt.compare(password, existingUser.password);
      if (!isEqual) {
        throw new Error("Password Doesn't Match");
      }
      const token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        "somerandomprivatekey",
        { expiresIn: "1h" }
      );
      return { userId: existingUser.id, token: token, tokenExpiration: 1 };
    } catch (error) {
      throw error;
    }
  },
};
