/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DialogResponses, IActionContext, ITreeItemPickerContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { postgresFlexibleFilter, postgresSingleFilter } from '../../constants';
import { ext } from "../../extensionVariables";
import { localize } from "../../utils/localize";
import { PostgresDatabaseTreeItem } from "../tree/PostgresDatabaseTreeItem";

export async function deletePostgresDatabaseCredentials(context: IActionContext, node?: PostgresDatabaseTreeItem): Promise<void> {
    const suppressCreateContext: ITreeItemPickerContext = context;
    suppressCreateContext.suppressCreatePick = true;
    if (!node) {
        node = await ext.rgApi.pickAppResource<PostgresDatabaseTreeItem>(context, {
            filter: [postgresSingleFilter, postgresFlexibleFilter],
            expectedChildContextValue: PostgresDatabaseTreeItem.contextValue
        });
    }

    const message: string = localize('deletesPostgresDatabaseCredentials', 'Are you sure you want to delete credentials for database "{0}"?', node.databaseName);
    const result = await context.ui.showWarningMessage(message, { modal: true, stepName: 'deletePostgresDatabaseConnection' }, DialogResponses.deleteResponse);
    if (result === DialogResponses.deleteResponse) {
        await node.parent.deletePostgresCredentials();
        const deleteMessage: string = localize('deletePostgresDatabaseConnectionMsg', 'Successfully deleted credentials for database "{0}".', node.databaseName);
        void vscode.window.showInformationMessage(deleteMessage);
        ext.outputChannel.appendLog(deleteMessage);
    }
}
