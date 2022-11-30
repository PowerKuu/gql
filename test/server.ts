import Client, { createServer } from "../gql"

const gql = new Client({
    url: "http://localhost:8080/graphql"
}, "./query.graphql")


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
            resolve: ["getUser", "name"]
        },

        "addUser": {
            global: false,
            resolve: ["addUser", "user", "name"]
        }
    }
})