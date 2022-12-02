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
export interface GqlMap {
    [name: string]: string;
}
export declare type ResolveFunctionType = ((data: {
    variables: {
        [name: string]: any;
    };
    data: any;
}) => any);
export declare type DrillType = (string | number)[];
export interface QueryOptions {
    drill?: DrillType;
    resolve?: ResolveFunctionType;
}
export interface Variables {
    [name: string]: string;
}
export interface SocketRoutes {
    [name: string]: {
        global: boolean;
        execute?: string;
        queryOptions: QueryOptions;
    };
}
export interface ServerOptions {
    socket: {
        server: SocketServerOptions;
        options?: Partial<SocketOptions>;
    };
    routes: SocketRoutes;
}
export declare function mapGraphql(path: string): GqlMap;
export default class Client {
    connection: Connection;
    graphqlPath: string;
    gqlMap: GqlMap;
    constructor(connection: Connection, graphqlPath: string);
    drillData(obj: Object, keys: DrillType): Object;
    run(name: string, options: QueryOptions, variables?: Variables): Promise<any>;
}
export declare function createServer(client: Client, options: ServerOptions): Server<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
export {};
