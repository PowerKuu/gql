"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.mapGraphql = void 0;
const node_fetch_1 = require("node-fetch");
const fs_1 = require("fs");
const path_1 = require("path");
const graphql_tag_1 = require("graphql-tag");
const graphql_1 = require("graphql");
const socket_io_1 = require("socket.io");
function mapGraphql(path) {
    const cwd = (0, path_1.dirname)(process.argv[1]);
    const rawGQL = (0, fs_1.readFileSync)((0, path_1.resolve)(cwd, path), {
        encoding: "utf-8"
    });
    const GQL = {};
    const parsed = (0, graphql_tag_1.default)(rawGQL);
    for (var definition of parsed.definitions) {
        if (definition.kind !== "OperationDefinition")
            continue;
        const operation = definition["operation"];
        const nameObject = definition["name"];
        if ((operation === "query" || operation === "mutation") && nameObject) {
            const nameError = () => { throw new Error(`Graphql ${operation} must have a name!`); };
            if (!nameObject || !nameObject["value"])
                nameError();
            const name = nameObject["value"];
            GQL[name] = (0, graphql_1.print)(definition);
        }
    }
    return GQL;
}
exports.mapGraphql = mapGraphql;
class Client {
    connection;
    graphqlPath;
    gqlMap;
    constructor(connection, graphqlPath) {
        this.connection = connection;
        this.graphqlPath = graphqlPath;
        this.gqlMap = mapGraphql(this.graphqlPath);
    }
    drillData(obj, keys) {
        var currentValue = obj;
        for (var key of keys) {
            if (!currentValue)
                break;
            if (key in currentValue) {
                currentValue = currentValue[key];
            }
            else {
                currentValue = null;
                break;
            }
        }
        return currentValue;
    }
    async run(name, options, variables = {}) {
        const request = await (0, node_fetch_1.default)(this.connection.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...this.connection.headers ?? {}
            },
            body: JSON.stringify({
                variables: variables,
                query: this.gqlMap[name],
            })
        });
        const json = await request.json();
        if (!json || !json.data)
            return null;
        var data = json.data;
        if (options.drill) {
            data = this.drillData(data, options.drill);
        }
        if (options.resolve) {
            data = options.resolve({ data, variables });
        }
        return data ?? null;
    }
}
exports.default = Client;
function createServer(client, options) {
    const server = new socket_io_1.Server(options.socket.server, options.socket.options);
    server.on("connection", (socket) => {
        for (const route of Object.keys(options.routes)) {
            socket.on(route, async (variables, id) => {
                const response = await client.run(options.routes[route].execute ?? route, options.routes[route].queryOptions, options.routes[route].intercept(variables) ?? variables);
                if (options.routes[route].global) {
                    server.emit(route, response, id);
                }
                else {
                    socket.emit(route, response, id);
                }
            });
        }
    });
    return server;
}
exports.createServer = createServer;
