import { HeadersInit } from "node-fetch";
export interface Connection {
    url: string;
    headers?: HeadersInit;
}
export default class GqlClient {
    connection: Connection;
    GQL: string;
    constructor(connection: Connection, GQL: string);
    run(name: string, variables?: {
        [key: string]: any;
    }): Promise<any>;
}
