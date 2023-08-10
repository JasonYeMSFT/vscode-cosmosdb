/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext, IAzureQuickPickItem } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { postgresFlexibleFilter, postgresSingleFilter } from "../../constants";
import { ext } from "../../extensionVariables";
import { localize } from "../../utils/localize";
import { nonNullProp } from '../../utils/nonNull';
import { PostgresServerType } from '../abstract/models';
import { PostgresServerTreeItem } from "../tree/PostgresServerTreeItem";
import { setPostgresCredentials } from "./setPostgresCredentials";

// @todo: Switch to forward link
export const postgresFlexibleAzureADDocumentationLink = "https://learn.microsoft.com/azure/postgresql/flexible-server/how-to-configure-sign-in-azure-ad-authentication";

export async function enterPostgresCredentials(context: IActionContext, treeItem?: PostgresServerTreeItem): Promise<void> {
    if (!treeItem) {
        treeItem = await ext.rgApi.pickAppResource<PostgresServerTreeItem>(context, {
            filter: [postgresSingleFilter, postgresFlexibleFilter]
        });
    }

    const aadCredentialOption: IAzureQuickPickItem = {
        data: undefined,
        group: "AzureAD",
        label: '$(account) Configure Azure AD',
        picked: true,
        priority: "highest"
    };
    const passwordCredentialOption: IAzureQuickPickItem = {
        data: undefined,
        group: "password",
        label: '$(key) Use username and password',
        priority: "highest"
    };
    const learnMoreOption: IAzureQuickPickItem = {
        data: undefined,
        group: "password",
        label: '$(warning) Authenticating with password is no longer recommended. Learn more...',
        priority: "normal"
    };
    let result = await context.ui.showQuickPick([
        aadCredentialOption,
        passwordCredentialOption,
        learnMoreOption
    ], {
        placeHolder: `Select credential type to use for server "${treeItem.label}"`,
        learnMoreLink: postgresFlexibleAzureADDocumentationLink,
        enableGrouping: true
    });

    if (result === passwordCredentialOption) {
        let username: string = await context.ui.showInputBox({
            prompt: localize('enterUsername', 'Enter username for server "{0}"', treeItem.label),
            stepName: 'enterPostgresUsername',
            validateInput: (value: string) => { return (value && value.length) ? undefined : localize('usernameCannotBeEmpty', 'Username cannot be empty.'); }
        });

        const serverName: string = nonNullProp(treeItem, 'azureName');
        // Username doesn't contain servername prefix for Postgres Flexible Servers only
        // As present on the portal for any Flexbile Server instance
        const usernameSuffix: string = `@${serverName}`;
        if (treeItem.serverType === PostgresServerType.Single && !username.includes(usernameSuffix)) {
            username += usernameSuffix;
        }

        const password: string = await context.ui.showInputBox({
            prompt: localize('enterPassword', 'Enter password for server "{0}"', treeItem.label),
            stepName: 'enterPostgresPassword',
            password: true,
            validateInput: (value: string) => { return (value && value.length) ? undefined : localize('passwordCannotBeEmpty', 'Password cannot be empty.'); }
        });

        const id: string = nonNullProp(treeItem, 'id');

        const progressMessage: string = localize('setupCredentialsMessage', 'Setting up credentials for server "{0}"...', serverName);
        const options: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: progressMessage
        };

        await vscode.window.withProgress(options, async () => {
            await setPostgresCredentials(username, password, id);
        });

        const completedMessage: string = localize('setupCredentialsMessage', 'Successfully added credentials to server "{0}".', serverName);
        void vscode.window.showInformationMessage(completedMessage);
        ext.outputChannel.appendLog(completedMessage);

        treeItem.setCredentials(username, password);

        await treeItem.refresh(context);
    } else if (result === aadCredentialOption) {
        // @todo: Code will reach here if user choose to use Azure AD and the currently it doesn't work.
        // Open the portal page so user can configure it.
        const portalUrl = treeItem?.subscription?.environment?.portalUrl;
        const azureId = treeItem?.azureId;
        if (!!portalUrl && !!azureId) {
            const urlObj = new URL(portalUrl);
            urlObj.hash = `@microsoft.onmicrosoft.com/resource${azureId}/activeDirectoryAdmins`;
            vscode.env.openExternal(vscode.Uri.parse(urlObj.toString()));
        } else if (portalUrl) {
            vscode.env.openExternal(vscode.Uri.parse(portalUrl));
        } else {
            // @todo: Show an error notification.
        }
    } else {
        vscode.env.openExternal(vscode.Uri.parse(postgresFlexibleAzureADDocumentationLink));
    }
}
