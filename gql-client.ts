import fetch, {HeadersInit} from "node-fetch"

export interface Connection {
    url: string,
    headers?: HeadersInit
}

export interface GQL {
    [name:string]: string
}

export default class GqlClient<T extends GQL> {
    constructor(public connection:Connection, public GQL:T) {}

    async run(name:keyof T, variables:{[key: string]: any} = {}) {
        const data = await fetch(this.connection.url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...this.connection.headers ?? {}
            },

            body: JSON.stringify({
                variables: variables,
                query: this.GQL[name],
            })
        })

        const json = await data.json()

        return json.data
    }
}