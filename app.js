const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const Events = require("./models/event.js");
const User = require("./models/user.js");
const bcrypt = require("bcryptjs");
const app = express();
app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

type Event {
  _id:ID!
  title: String!
  description: String!
  price: Float!
createdAt:String
}

type User{
_id:ID!
email:String!
password: String
}


input EventInput{
  title: String!
  description: String!
  price: Float!
 createdAt:String
}

input UserInput {
  email: String!
  password: String!
}

  type RootQuery{
    events :[Event!]!
  }

  type RootMutation{
    createEvent(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
  }


  schema{
    query:RootQuery
    mutation:RootMutation
  }
  `),
    rootValue: {
      events: () => {
        return Events.find()
          .then((events) => {
            return events.map((event) => {
              return {
                ...event._doc,
                createdAt: event._doc.createdAt.toString(),
              };
            });
          })
          .catch((err) => {
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Events({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          creator: "64a27c28f0c6b0ea2a0e264b",
        });
        let createdEvent;

        return event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc };

            return User.findById("64a27c28f0c6b0ea2a0e264b");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User Not Found");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((result) => {
            return createdEvent;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },

      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User Already Exists");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            return { ...result._doc, password: null };
          })
          .catch((err) => {
            throw err;
          });
      },
    },
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
