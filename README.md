# npm i @klevn/gql

```gql
# test.graphql

query world($pass: String!){
    todoHistoryByPassword(password: $pass) {
        _id
    }
}
```

```ts
import Client from "@klevn/gql-client"

const gql = new Client({
    url: "https://graphql.eu.fauna.com/graphql",
    headers: {
        "authorization": "Basic 123"
    }
}, "./test.graphql")

gql.run("world", {
    pass: "hello",
    
    resolve: ["todoHistoryByPassword", "_id"]
}).then(console.log)

// Se also "createServer()" for a socket server.
```
