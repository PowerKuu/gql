import Client, { createServer } from "../gql"

const gql = new Client({
    url: "http://localhost:8080/graphql"
}, "./query.graphql")


createServer(gql, {
    socket: {
        server: 5499,
        options: {
            cors: {
                origin: "http://127.0.0.1:5500"
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