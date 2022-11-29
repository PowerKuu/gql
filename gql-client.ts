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

export interface Variables {
    resolve?: (string|number)[]|((data:any) => any)
    [name:string]: any
}


export function parseGraphql(path:string): GQL {
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
        this.GQL = parseGraphql(this.graphqlPath)
    }

    drillData(obj:Object, keys:(string|number)[]) {
        var currentValue = obj

        for (var key of keys) {
            if (key in currentValue) {
                currentValue = currentValue[key]
                break
            } else {
                currentValue = null
                break
            }
        }

        return currentValue
    }

    async run(name:string, variables:Variables = {}) {
        const request = await fetch(this.connection.url, {
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

        const json = await request.json()
        if (!json || json.data) return null

        var data = json.data

        if (variables.resolve && Array.isArray(variables.resolve)) {
            data = this.drillData(data, variables.resolve)
        } else if (variables.resolve) {
            var resolveFunction = variables.resolve as Function

            data = resolveFunction(data)
            if (!data) return null
        }

        return data 
    }
}