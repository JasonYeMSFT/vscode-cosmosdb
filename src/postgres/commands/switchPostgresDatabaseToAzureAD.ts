/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DialogResponses, IActionContext, ITreeItemPickerContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { postgresFlexibleFilter, postgresSingleFilter } from '../../constants';
import { ext } from "../../extensionVariables";
import { localize } from "../../utils/localize";
import { PostgresServerTreeItem } from "../tree/PostgresServerTreeItem";
import { postgresFlexibleAzureADDocumentationLink } from "./enterPostgresCredentials";

export async function switchToAzureAD(context: IActionContext, node?: PostgresServerTreeItem): Promise<void> {
    const suppressCreateContext: ITreeItemPickerContext = context;
    suppressCreateContext.suppressCreatePick = true;
    if (!node) {
        node = await ext.rgApi.pickAppResource<PostgresServerTreeItem>(context, {
            filter: [postgresSingleFilter, postgresFlexibleFilter],
            expectedChildContextValue: PostgresServerTreeItem.contextValue
        });
    }

    // @todo: Gather feedback on what to mention in this prompt.
    // Things people would normally need to do:
    // - Enable Azure AD (if hasn't )
    // - Create a new user and assign roles
    // - Transfer ownership from previous user to the new user
    // - * Optional. Delete the previous user.
    const message: string = localize('switchToAzureADPrompt', 'Switching to authenticate with Azure AD will delete the stored passwords for database server "{0}". Please make sure you have configured the Azure AD roles and transferred the ownership of resources.', node.azureName);
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
        node?.parent?.refresh(context);
    } else if (result === DialogResponses.learnMore) {
        vscode.env.openExternal(vscode.Uri.parse(postgresFlexibleAzureADDocumentationLink));
    }
}
