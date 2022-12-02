# GQL for dgraph

### Intall
```npm i @klevn/gql```

```ts
import Client, { createServer } from "../gql"

const gql = new Client({
    url: "http://localhost:8080/graphql"
}, "./query.graphql")

// U can also use "gql.run" to run it without a server

createServer(gql, {
    socket: {
        server: 5499,
        options: {
            cors: {
                origin: "*"
            }
        }
    },

    routes: {
        "getUser": {
            global: false,
            queryOptions: {
                drill: ["getUser", "name"],
                resolve: ({data, variables}) => {
                    console.log(variables)
                    return data
                }
            }
        },

        "addUser": {
            global: false,
            queryOptions: {
                drill: ["addUser", "user", "name"]
            }
        }
    }
})
```

### schema.graphql
[Use dgraph-dedicated to setup a database and schema](https://github.com/PowerKuu/dgraph-dedicated)
```graphql
type User {
    name: String! @id
    age: Int!
}
```

### query.graphql
```graphql
query getUser($name: String!){
  getUser(name: $name) {
    name
  }
}

mutation addUser($name: String! $age: Int!){
  addUser(input: {
    name: $name
    age: $age
  }) {
    user {
      name
      age
    } 
  }
}
```
