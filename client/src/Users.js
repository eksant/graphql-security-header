import React from "react";
import { useQuery, gql } from "@apollo/client";

const QUERY_USERS = gql`
  query getUsers {
    users {
      username
    }
  }
`;

export default function Users() {
  const { loading, data } = useQuery(QUERY_USERS);

  return (
    <>
      <p>LIST USER</p>
      {loading ? (
        <label>Loading...</label>
      ) : (
        <ul>
          {data &&
            data.users.map((item, key) => {
              return <li key={key}>{item.username}</li>;
            })}
        </ul>
      )}
    </>
  );
}
