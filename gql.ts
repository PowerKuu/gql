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
    url: string
    headers?: HeadersInit
}

export interface GqlMap {
    [name:string]: string
}

export type ResolveFunctionType = ((data: {variables:{[name:string]: any}, data:any}) => any)
export type ResolveType = (string|number)[]|ResolveFunctionType

export interface Variables {
    resolve?: ResolveType
    [name:string]: any
}




export interface SocketRoutes {
    [name: string]: {
        global: boolean
        execute?: string
        resolve?: ResolveType
    }
}

export interface ServerOptions {
    socket: {
        server: SocketServerOptions
        options?: Partial<SocketOptions>
    }
    routes: SocketRoutes
}



export function mapGraphql(path:string): GqlMap {
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
    gqlMap:GqlMap

    constructor(public connection:Connection, public graphqlPath:string) {
        this.gqlMap = mapGraphql(this.graphqlPath)
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
                query: this.gqlMap[name],
            })
        })

        const json = await request.json()

        if (!json || !json.data) return null

        var data = json.data


        if (variables.resolve && Array.isArray(variables.resolve)) {
            data = this.drillData(data, variables.resolve)
        } else if (variables.resolve) {
            var resolveFunction = variables.resolve as ResolveFunctionType

            data = resolveFunction({data, variables})
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
                const setNull = Boolean(data.resolve)
                data.resolve = options.routes[route].resolve

                const response = setNull ? null : await client.run(options.routes[route].execute ?? route, data)

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