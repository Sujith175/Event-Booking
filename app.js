const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const isAuth = require("./middleware/auth-check");
const app = express();
app.use(bodyParser.json());
const graphQlSchema = require("./graphQl/schema/index.js");
const graphQlResolvers = require("./graphQl/resolvers/index.js");

app.use(isAuth);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.enibzwf.mongodb.net/`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
