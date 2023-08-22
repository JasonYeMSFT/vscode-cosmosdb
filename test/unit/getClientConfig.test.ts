/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { describe, it } from 'mocha';
import { postgresDefaultPort } from '../../src/constants';
import { PostgresServerType } from '../../src/postgres/abstract/models';
import { getClientConfig } from '../../src/postgres/getClientConfig';
import { ParsedPostgresConnectionString } from '../../src/postgres/postgresConnectionStrings';

describe("getClientConfig Tests", () => {
    describe("in subscription", () => {
        it("Has username and password", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    user: "fake_user",
                    password: "fake_password",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                false
            );
            assert(clientConfig?.user === "fake_user");
            assert(clientConfig?.password === "fake_password");
            assert(clientConfig?.host === "fake_host.com");
            assert(clientConfig?.port === 1234);
        });

        // Cannot test null/undefined host because if it is the case, the code has thrown much earlier when constructing the ParsedPostgresConnectionString object.

        it("Missing port", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    user: "fake_user",
                    password: "fake_password",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                false
            );
            assert(clientConfig?.user === "fake_user");
            assert(clientConfig?.password === "fake_password");
            assert(clientConfig?.host === "fake_host.com");
            assert(clientConfig?.port === parseInt(postgresDefaultPort), "Should fallback to default port");
        });

        it("Missing username and has no aad credential", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    password: "fake_password",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                false
            );
            assert(clientConfig === undefined);
        });

        it("Missing password and has no aad credential", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    user: "fake_user",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                false
            );
            assert(clientConfig === undefined);
        });

        it("Missing password but has aad credential (flexible server)", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                false,
                "fake_azureAd_userId",
                async () => "fake_token"
            );
            assert(clientConfig?.user === "fake_azureAd_userId");
            assert(typeof clientConfig?.password === "function");
            assert(clientConfig?.host === "fake_host.com");
            assert(clientConfig?.port === 1234);
        });

        it("Has password and aad credential - prefer aad (flexible server)", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    database: "fake_database",
                    user: "fake_user",
                    password: "fake_password"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                true,
                "fake_azureAd_userId",
                async () => "fake_token"
            );
            assert(clientConfig?.user === "fake_azureAd_userId");
            assert(typeof clientConfig?.password === "function");
            assert(clientConfig?.host === "fake_host.com");
            assert(clientConfig?.port === 1234);
        });

        it("Has password and aad credential - prefer password (flexible server)", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    database: "fake_database",
                    user: "fake_user",
                    password: "fake_password"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                true,
                databaseName,
                false,
                "fake_azureAd_userId",
                async () => "fake_token"
            );
            assert(clientConfig?.user === "fake_user");
            assert(clientConfig?.password === "fake_password");
            assert(clientConfig?.host === "fake_host.com");
            assert(clientConfig?.port === 1234);
        });

        it("Missing password but has aad credential - prefer aad (single server)", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Single,
                true,
                databaseName,
                false,
                "fake_azureAd_userId",
                async () => "fake_token"
            );
            assert(clientConfig === undefined);
        });

        it("Missing password but has aad credential - prefer password (single server)", async () => {
            const parsedConnectionString = new ParsedPostgresConnectionString(
                "",
                {
                    host: "fake_host.com",
                    port: "1234",
                    database: "fake_database"
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Single,
                true,
                databaseName,
                false,
                "fake_azureAd_userId",
                async () => "fake_token"
            );
            assert(clientConfig === undefined);
        });
    });

    describe("in attachment", () => {
        it("connection string", async () => {
            const rawConnectionString = "postgres://fake_connection_string";
            const parsedConnectionString = new ParsedPostgresConnectionString(
                rawConnectionString,
                {
                    host: "fake_host",
                    database: null
                }
            );
            const databaseName = "fake_database_2";

            const clientConfig = await getClientConfig(
                parsedConnectionString,
                PostgresServerType.Flexible,
                false,
                databaseName,
                false
            );
            const augmentedConnectionString = `${rawConnectionString}/${databaseName}`;
            assert(clientConfig?.connectionString === augmentedConnectionString);
        });
    });
});
