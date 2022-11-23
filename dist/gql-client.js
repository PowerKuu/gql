import fetch from "node-fetch";
export default class GqlClient {
    connection;
    GQL;
    constructor(connection, GQL) {
        this.connection = connection;
        this.GQL = GQL;
    }
    async run(name, variables = {}) {
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
        });
        const json = await data.json();
        return json;
    }
}
