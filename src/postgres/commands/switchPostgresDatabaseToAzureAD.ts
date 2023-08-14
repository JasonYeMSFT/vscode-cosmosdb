/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DialogResponses, IActionContext, ITreeItemPickerContext } from "@microsoft/vscode-azext-utils";
import { ClientConfig } from "pg";
import * as vscode from 'vscode';
import { postgresFlexibleFilter, postgresSingleFilter } from '../../constants';
import { ext } from "../../extensionVariables";
import { localize } from "../../utils/localize";
import { getAzureADClientConfig } from "../getClientConfig";
import { PostgresDatabaseTreeItem } from "../tree/PostgresDatabaseTreeItem";
import { PostgresServerTreeItem } from "../tree/PostgresServerTreeItem";
import { openDatabaseAuthenticationPage, postgresFlexibleAzureADDocumentationLink } from "./enterPostgresCredentials";

export async function switchToAzureAD(context: IActionContext, node?: PostgresServerTreeItem): Promise<void> {
    const suppressCreateContext: ITreeItemPickerContext = context;
    suppressCreateContext.suppressCreatePick = true;
    if (!node) {
        node = await ext.rgApi.pickAppResource<PostgresServerTreeItem>(context, {
            filter: [postgresSingleFilter, postgresFlexibleFilter],
            expectedChildContextValue: PostgresServerTreeItem.contextValue
        });
    }

    // Test if the user's Azure AD credentials work for the database
    const firstDatabase = (await node.getCachedChildren(context))[0] as PostgresDatabaseTreeItem;
    let azureADClientConfig: ClientConfig | undefined;
    try {
        azureADClientConfig = await getAzureADClientConfig(node, firstDatabase.databaseName);
    } catch (error) {
        // Noop
    }

    if (!azureADClientConfig) {
        // We know the user hasn't configured his Azure AD credentials because it cannot connect to his database.
        // Open the authentication page for him to configure.
        const message: string = localize('switchToAzureADFailure', 'Failed to connect to the database server using Azure AD credential. Please configure the Azure AD user and retry switching.');
        void vscode.window.showInformationMessage(message);
        openDatabaseAuthenticationPage(node);
    } else {
        const message: string = localize('switchToAzureADPrompt', 'Switching to authenticate with Azure AD will delete the stored password for database server "{0}". Please make sure you have configured the Azure AD roles and transferred the ownership of resources.', node.azureName);
        const result = await context.ui.showWarningMessage(message,
            { modal: true, stepName: 'switchPostgresDataBaseToAzureAD' },
            DialogResponses.yes,
            DialogResponses.learnMore,
        );
        if (result === DialogResponses.yes) {
            await node.deletePostgresCredentials();
            const deleteMessage: string = localize('switchToAzureADResult', 'Successfully deleted passwords for database server "{0}".', node.azureName);
            void vscode.window.showInformationMessage(deleteMessage);
            ext.outputChannel.appendLog(deleteMessage);

            // Auto refresh the server's parent node to
            // - update the state of the node
            // - reload resources using the new credential
            node.refresh(context);
        } else if (result === DialogResponses.learnMore) {
            vscode.env.openExternal(vscode.Uri.parse(postgresFlexibleAzureADDocumentationLink));
        }
    }
}
