/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CosmosClient } from "@azure/cosmos";
import { ISubscriptionContext, appendExtensionUserAgent } from "@microsoft/vscode-azext-utils";
import * as https from "https";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";

export type CosmosDBKeyCredential = {
    type: "key";
    key: string;
};
export type CosmosDBAuthCredential = {
    type: "auth";
    subscription: ISubscriptionContext
}
export type CosmosDBCredential = CosmosDBKeyCredential | CosmosDBAuthCredential;

export function getCosmosClient(
    endpoint: string,
    cosmosDBCredentials: CosmosDBCredential[],
    isEmulator: boolean | undefined,
): CosmosClient {
    const vscodeStrictSSL: boolean | undefined = vscode.workspace.getConfiguration().get<boolean>(ext.settingsKeys.vsCode.proxyStrictSSL);
    const enableEndpointDiscovery: boolean | undefined = vscode.workspace.getConfiguration().get<boolean>(ext.settingsKeys.enableEndpointDiscovery);
    const connectionPolicy = { enableEndpointDiscovery: (enableEndpointDiscovery === undefined) ? true : enableEndpointDiscovery };

    const keyCred = cosmosDBCredentials.filter((cred): cred is CosmosDBKeyCredential => cred.type === "key")[0];
    const authCred = cosmosDBCredentials.filter((cred): cred is CosmosDBAuthCredential => cred.type === "auth")[0];
    if (keyCred) {
        return new CosmosClient({
            endpoint,
            key: keyCred.key,
            userAgentSuffix: appendExtensionUserAgent(),
            agent: new https.Agent({ rejectUnauthorized: isEmulator ? !isEmulator : vscodeStrictSSL }),
            connectionPolicy: connectionPolicy
        });
    } else if (authCred) {
        return new CosmosClient({
            endpoint,
            tokenProvider: async () => {
                // This is blocked because the auth package ignores the scope we pass in and always acquire tokens for audience "https://management.azure.com"
                // It needs to be fixed in the auth package for retesting
                const result = await authCred.subscription.credentials.getToken("https://jasonsql.documents.azure.com/.default");
                return `type=aad&ver=1.0&sig=${result?.token}`;
            },
            userAgentSuffix: appendExtensionUserAgent(),
            agent: new https.Agent({ rejectUnauthorized: isEmulator ? !isEmulator : vscodeStrictSSL }),
            connectionPolicy: connectionPolicy
        });
    } else {
        throw Error("No credentials available to create CosmosClient");
    }
}
