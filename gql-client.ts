import fetch, {HeadersInit} from "node-fetch"
import { readFileSync } from "fs"
import { resolve } from "path"

import gql from 'graphql-tag';
import { print } from 'graphql'

export interface Connection {
    url: string,
    headers?: HeadersInit
}

export interface GQL {
    [name:string]: string
}


export function parseGraphqlObject(path:string): GQL {
    const rawGQL = readFileSync(resolve(process.cwd(), path), {
        encoding: "utf-8"
    })

    const GQL = {}
    const parsed = gql(rawGQL)

    for (var definition of parsed.definitions) {
        if (definition.kind !== "OperationDefinition") continue

        const operation = definition["operation"]
        const nameObject = definition["name"]
        if ((operation === "query" || operation === "mutation") && nameObject) {
            const nameError = () => {throw new Error(`Graphql ${operation} must have a name!`)}
            if (!nameObject || !nameObject["value"]) nameError()
            const name = nameObject["value"]
    
            GQL[name] = print(definition)
        }
    }

    return GQL
}


export default class GqlClient {
    GQL:GQL
    constructor(public connection:Connection, public graphqlPath:string) {
        this.GQL = parseGraphqlObject(this.graphqlPath)
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
                query: this.GQL[name],
            })
        })

        const json = await data.json()

        return json.data
    }
}