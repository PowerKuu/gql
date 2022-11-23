```ts
import GqlClient from "@klevn/gql-client"

const GQL = {
    hello: `
    query ($pass: String!){
        todoHistoryByPassword(password: $pass) {
            _id
        }
    }
    `

    world: `
    query ($pass: String!){
        todoHistoryByPassword(password: $pass) {
            _id
        }
    }
    `
}


const gql = new GqlClient({
    url: "https://graphql.eu.fauna.com/graphql",
    headers: {
        "authorization": "Basic Zm5BRTJBY1dnZEFBMEdvaFQ4U0ZZdW9ROXRERUZPWVhCU1pfSzdVODp0b2RvLWRhaWx5OmFkbWlu"
    }
}, GQL)

gql.run("world", {
    pass: "hello"
}).then(console.log)
```