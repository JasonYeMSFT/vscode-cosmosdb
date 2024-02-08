/*--------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AgentBenchmarkConfig, AzureUserInputQueue, IAzureAgentInput, WizardBasedCommandConfig, callWithTelemetryAndErrorHandling } from "@microsoft/vscode-azext-utils";
import { createServer } from "../extension";

export function getWizardCommands(): WizardBasedCommandConfig[] {
    return [
        {
            type: "wizard",
            name: "createPostgresFlexibleServerWithWizard",
            commandId: "azureDatabases.createServer",
            displayName: "Create PostgreSQL Flexible Server",
            intentDescription: "This is best when users ask to create a PostgreSQL Flexible Server in Azure. They may refer to a PostgreSQL Flexible Server as 'PostgreSQL Flexible Server', 'Postgres Flexible Server', 'postgres flexible server', etc. This command is not useful if the user is asking how to do something, or if something is possible.",
            requiresAzureLogin: true,
        }
    ];
}

export async function runWizardCommandWithoutExecution(command: WizardBasedCommandConfig, ui: IAzureAgentInput): Promise<void> {
    console.log("runWizardCommandWithoutExecution", command);
    if (command.commandId === "azureDatabases.createServer") {
        await callWithTelemetryAndErrorHandling("azureDatabases.createPostgresFlexibleServerViaAgent", async (context) => {
            return await createServer({ ...context, ui: ui });
        });
    } else {
        throw new Error('Unknown command: ' + command.commandId);
    }
}

export async function runWizardCommandWithInputs(_command: WizardBasedCommandConfig, _inputsQueue: AzureUserInputQueue): Promise<void> {
    console.log("runWizardCommandWithInputs", _command, _inputsQueue);
    // if (command.commandId === "createPostgresFlexibleServerWithWizard") {
    //     await callWithTelemetryAndErrorHandling('azureFunctions.createFunctionAppViaAgent', async (context) => {
    //         const azureUserInput = new AzExtUserInputWithInputQueue(context, inputsQueue);
    //         // return await createFunctionApp({ ...context, ui: azureUserInput });
    //     });
    // } else {
    //     throw new Error('Unknown command: ' + command.commandId);
    // }
}

export function getAgentBenchmarkConfigs(): AgentBenchmarkConfig[] {
    return [
        {
            name: "Brainstorm - Learn/Brainstorm About PostgreSQL stored procedures",
            prompt: "How can I use a PostgreSQL stored procedure to save a query and run it in the future?",
            acceptableHandlerChains: [
                ["postgreSQL", "learn"],
                ["postgreSQL", "brainstorm"],
            ],
        },
        {
            name: "Learn - PostgreSQL Flexible Server vs PostgreSQL Single Server",
            prompt: "What is the difference between PostgreSQL Flexible Server vs PostgreSQL Single Server?",
            acceptableHandlerChains: [
                ["postgreSQL", "learn"],
                ["postgreSQL", "brainstorm"],
            ],
        }
    ];
}
