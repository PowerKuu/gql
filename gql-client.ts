import fetch, {HeadersInit} from "node-fetch"

export interface Connection {
    url: string,
    headers?: HeadersInit
}

export default class GqlClient {
    constructor(public connection:Connection, public GQL:string) {}

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
