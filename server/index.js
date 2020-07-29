const cors = require("cors");
const express = require("express");
const moment = require("moment");
const {
  gql,
  ApolloServer,
  AuthenticationError,
} = require("apollo-server-express");

const util = require("./util");

const app = express();
app.use(cors());

const typeDefs = gql`
  type Query {
    users: [Users!]!
  }

  type Users {
    username: String!
  }
`;

const resolvers = {
  Query: {
    users: () => {
      return [
        { username: "Eksa" },
        { username: "Bukan Eksa" },
        { username: "Selain Eksa" },
        { username: "Seorang Eksa" },
      ];
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    /** adding security header */
    const timestamp =
      moment.utc().unix() - moment.utc("1970-01-01 00:00:00").unix();
    const consumerSecret = "client-secret-key";
    const consumerId = "1234567890";
    const signatureClient = req.headers["x-signature"];
    const signature = util.hmacEncrypt(
      `${consumerId}&${timestamp}`,
      consumerSecret
    );

    if (signatureClient !== signature)
      throw new AuthenticationError("You do not have authentication this");
  },
});

server.applyMiddleware({ app, path: "/graphql" });
app.listen({ port: 3003 }, () => {
  console.log("Apollo Server on http://localhost:3003/graphql");
});
