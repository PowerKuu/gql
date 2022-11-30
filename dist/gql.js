"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = exports.parseGraphql = void 0;
const node_fetch_1 = require("node-fetch");
const fs_1 = require("fs");
const path_1 = require("path");
const graphql_tag_1 = require("graphql-tag");
const graphql_1 = require("graphql");
const socket_io_1 = require("socket.io");
function parseGraphql(path) {
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
exports.parseGraphql = parseGraphql;
class Client {
    connection;
    graphqlPath;
    gqlSchema;
    constructor(connection, graphqlPath) {
        this.connection = connection;
        this.graphqlPath = graphqlPath;
        this.gqlSchema = parseGraphql(this.graphqlPath);
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
    async run(name, variables = {}) {
        const requstVariables = { ...variables };
        if (requstVariables.resolve)
            delete requstVariables.resolve;
        const request = await (0, node_fetch_1.default)(this.connection.url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...this.connection.headers ?? {}
            },
            body: JSON.stringify({
                variables: requstVariables,
                query: this.gqlSchema[name],
            })
        });
        const json = await request.json();
        if (!json || !json.data)
            return null;
        var data = json.data;
        if (variables.resolve && Array.isArray(variables.resolve)) {
            data = this.drillData(data, variables.resolve);
        }
        else if (variables.resolve) {
            var resolveFunction = variables.resolve;
            data = resolveFunction(data);
            if (!data)
                return null;
        }
        return data;
    }
}
exports.default = Client;
function createServer(client, options) {
    const server = new socket_io_1.Server(options.socket.server, options.socket.options);
    server.on("connection", (socket) => {
        for (const route of Object.keys(options.routes)) {
            socket.on(route, async (data) => {
                data.resolve = options.routes[route].resolve;
                const response = await client.run(route, data);
                if (options.routes[route].global) {
                    server.emit(route, response);
                }
                else {
                    socket.emit(route, response);
                }
            });
        }
    });
    return server;
}
exports.createServer = createServer;
