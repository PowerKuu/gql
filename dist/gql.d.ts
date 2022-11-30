/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { HeadersInit } from "node-fetch";
import { Server, ServerOptions as SocketOptions } from "socket.io";
import type { Server as HTTPSServer } from "https";
import type { Http2SecureServer } from "http2";
import { Server as HTTPServer } from "http";
declare type SocketServerOptions = HTTPServer | HTTPSServer | Http2SecureServer | number;
export interface Connection {
    url: string;
    headers?: HeadersInit;
}
export interface GqlSchema {
    [name: string]: string;
}
export declare type ResolveType = (string | number)[] | ((data: any) => any);
export interface Variables {
    resolve?: ResolveType;
    [name: string]: any;
}
export interface SocketRoutes {
    [name: string]: {
        global: boolean;
        resolve?: ResolveType;
    };
}
export interface ServerOptions {
    socket: {
        server: SocketServerOptions;
        options?: Partial<SocketOptions>;
    };
    routes: SocketRoutes;
}
export declare function parseGraphql(path: string): GqlSchema;
export default class Client {
    connection: Connection;
    graphqlPath: string;
    gqlSchema: GqlSchema;
    constructor(connection: Connection, graphqlPath: string);
    drillData(obj: Object, keys: (string | number)[]): Object;
    run(name: string, variables?: Variables): Promise<any>;
}
export declare function createServer(client: Client, options: ServerOptions): Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
export {};
