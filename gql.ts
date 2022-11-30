import fetch, {HeadersInit} from "node-fetch"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"

import gql from 'graphql-tag';
import { print } from 'graphql'

import { Server, ServerOptions as SocketOptions } from "socket.io"
import type { Server as HTTPSServer } from "https";
import type { Http2SecureServer } from "http2"
import { Server as HTTPServer } from "http"

type SocketServerOptions = HTTPServer | HTTPSServer | Http2SecureServer | number

export interface Connection {
    url: string,
    headers?: HeadersInit
}

export interface GqlSchema {
    [name:string]: string
}

export type ResolveType = (string|number)[]|((data:any) => any)

export interface Variables {
    resolve?: ResolveType
    [name:string]: any
}




export interface SocketRoutes {
    [name: string]: {
        global: boolean,
        resolve?: ResolveType
    }
}

export interface ServerOptions {
    socket: {
        server: SocketServerOptions,
        options?: Partial<SocketOptions>
    }
    routes: SocketRoutes
}



export function parseGraphql(path:string): GqlSchema {
    const cwd = dirname(process.argv[1])
    const rawGQL = readFileSync(resolve(cwd, path), {
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


export default class Client {
    gqlSchema:GqlSchema

    constructor(public connection:Connection, public graphqlPath:string) {
        this.gqlSchema = parseGraphql(this.graphqlPath)
    }

    drillData(obj:Object, keys:(string|number)[]) {
        var currentValue:Object|null = obj

        for (var key of keys) {
            if (!currentValue) break

            if (key in currentValue) {
                currentValue = currentValue[key]
            } else {
                currentValue = null
                break
            }
        }

        return currentValue
    }

    async run(name:string, variables:Variables = {}) {
        const requstVariables = { ...variables }
        if(requstVariables.resolve) delete requstVariables.resolve

        const request = await fetch(this.connection.url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...this.connection.headers ?? {}
            },

            body: JSON.stringify({
                variables: requstVariables,
                query: this.gqlSchema[name],
            })
        })

        const json = await request.json()

        if (!json || !json.data) return null

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

export function createServer(client:Client, options:ServerOptions){
    const server = new Server(options.socket.server, options.socket.options)

    server.on("connection", (socket) => {
        for (const route of Object.keys(options.routes)) {
            socket.on(route, async (data) => {
                data.resolve = options.routes[route].resolve

                const response = await client.run(route, data)
                if (options.routes[route].global) {
                    server.emit(route, response)
                } else {
                    socket.emit(route, response)
                }
            })
        }
    })

    return server
}