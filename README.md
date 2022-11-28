```gql
    # test.graphql

    query world($pass: String!){
        todoHistoryByPassword(password: $pass) {
            _id
        }
    }
```

```ts
import GqlClient from "@klevn/gql-client"

const gql = new GqlClient({
    url: "https://graphql.eu.fauna.com/graphql",
    headers: {
        "authorization": "Basic 123"
    }
}, "./test.graphql")

gql.run("world", {
    pass: "hello"
}).then(console.log)
```