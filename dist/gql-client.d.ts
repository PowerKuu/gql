import { HeadersInit } from "node-fetch";
export interface Connection {
    url: string;
    headers?: HeadersInit;
}
export interface GQL {
    [name: string]: string;
}
export interface Variables {
    resolve?: (string | number)[] | ((data: any) => any);
    [name: string]: any;
}
export declare function parseGraphql(path: string): GQL;
export default class GqlClient {
    connection: Connection;
    graphqlPath: string;
    GQL: GQL;
    constructor(connection: Connection, graphqlPath: string);
    drillData(obj: Object, keys: (string | number)[]): Object;
    run(name: string, variables?: Variables): Promise<any>;
}
