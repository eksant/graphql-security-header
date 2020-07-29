import React from "react";
import moment from "moment";
import ReactDOM from "react-dom";
import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  split,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import "./index.css";
import Users from "./Users";
import logo from "./logo.svg";
import util from "./util";
import * as serviceWorker from "./serviceWorker";

const uri = "http://localhost:3003/graphql";

const createLink = () => {
  /** adding security header */
  const timestamp =
    moment.utc().unix() - moment.utc("1970-01-01 00:00:00").unix();
  const consumerId = "1234567890";
  const consumerSecret = "client-secret-key";
  const signature = util.hmacEncrypt(
    `${consumerId}&${timestamp}`,
    consumerSecret
  );
  const headers = {
    "X-timestamp": timestamp,
    "X-cons-id": consumerId,
    "X-signature": signature,
  };

  const httpLink = new HttpLink({ uri, headers });
  const wsLink = new WebSocketLink({
    uri,
    options: { reconnect: true, lazy: true, timeout: 20000 },
  });

  return split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpLink
  );
};

const onErrorHandler = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([onErrorHandler, createLink()]),
});

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          target="_blank"
          className="App-link"
          rel="noopener noreferrer"
          href="https://github.com/eksant/graphql-security-header"
        >
          Graphql Security Header Repo
        </a>

        <Users />
      </header>
    </div>
  );
};

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
