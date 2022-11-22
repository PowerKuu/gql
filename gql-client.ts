import fetch, {HeadersInit} from "node-fetch"

interface Connection {
    url: string,
    headers?: HeadersInit
}

class GqlClient {
    constructor(public connection:Connection, public GQL:string) {

    }

    async run(name:string, variables:{[key: string]: any} = {}) {
        const data = await fetch(this.connection.url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...this.connection.headers ?? {}
            },

            body: JSON.stringify({
                variables: variables,
                operationName: name,

                query: this.GQL,
            })
        })

        const json = await data.json()

        return json
    }
}


const GQL = `
    query hello($pass: String!){
        todoHistoryByPassword(password: $pass) {
        _id
        }
    }

    query world($pass: String!){
        todoHistoryByPassword(password: $pass) {
        _id
        }
    }
`

const gql = new GqlClient({
    url: "https://graphql.eu.fauna.com/graphql",
    headers: {
        "authorization": "Basic Zm5BRTJBY1dnZEFBMEdvaFQ4U0ZZdW9ROXRERUZPWVhCU1pfSzdVODp0b2RvLWRhaWx5OmFkbWlu"
    }
}, GQL)

gql.run("world", {
    pass: "hello"
}).then(console.log)