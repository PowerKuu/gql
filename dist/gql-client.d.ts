import { HeadersInit } from "node-fetch";
export interface Connection {
    url: string;
    headers?: HeadersInit;
}
export interface GQL {
    [name: string]: string;
}
export declare function parseGraphqlObject(path: string): GQL;
export default class GqlClient {
    connection: Connection;
    graphqlPath: string;
    GQL: GQL;
    constructor(connection: Connection, graphqlPath: string);
    run(name: string, variables?: {
        [key: string]: any;
    }): Promise<any>;
}
