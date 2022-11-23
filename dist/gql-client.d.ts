import { HeadersInit } from "node-fetch";
export interface Connection {
    url: string;
    headers?: HeadersInit;
}
export interface GQL {
    [name: string]: string;
}
export default class GqlClient<T extends GQL> {
    connection: Connection;
    GQL: T;
    constructor(connection: Connection, GQL: T);
    run(name: keyof T, variables?: {
        [key: string]: any;
    }): Promise<any>;
}
