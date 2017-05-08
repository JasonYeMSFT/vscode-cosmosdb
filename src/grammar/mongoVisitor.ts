// Generated from ./grammar/mongo.g4 by ANTLR 4.6-SNAPSHOT


import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';

import { MongoCommandsContext } from './mongoParser';
import { CommandsContext } from './mongoParser';
import { CommandContext } from './mongoParser';
import { EmptyCommandContext } from './mongoParser';
import { CollectionContext } from './mongoParser';
import { FunctionCallContext } from './mongoParser';
import { ArgumentsContext } from './mongoParser';
import { ArgumentListContext } from './mongoParser';
import { ObjectLiteralContext } from './mongoParser';
import { ArrayLiteralContext } from './mongoParser';
import { ElementListContext } from './mongoParser';
import { PropertyNameAndValueListContext } from './mongoParser';
import { PropertyAssignmentContext } from './mongoParser';
import { PropertyValueContext } from './mongoParser';
import { LiteralContext } from './mongoParser';
import { PropertyNameContext } from './mongoParser';
import { NumericLiteralContext } from './mongoParser';


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `mongoParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface mongoVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `mongoParser.mongoCommands`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMongoCommands?: (ctx: MongoCommandsContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.commands`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommands?: (ctx: CommandsContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.command`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommand?: (ctx: CommandContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.emptyCommand`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEmptyCommand?: (ctx: EmptyCommandContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.collection`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCollection?: (ctx: CollectionContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.functionCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionCall?: (ctx: FunctionCallContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.arguments`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArguments?: (ctx: ArgumentsContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.argumentList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgumentList?: (ctx: ArgumentListContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.objectLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitObjectLiteral?: (ctx: ObjectLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.arrayLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArrayLiteral?: (ctx: ArrayLiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.elementList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitElementList?: (ctx: ElementListContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.propertyNameAndValueList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPropertyNameAndValueList?: (ctx: PropertyNameAndValueListContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.propertyAssignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPropertyAssignment?: (ctx: PropertyAssignmentContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.propertyValue`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPropertyValue?: (ctx: PropertyValueContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.literal`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral?: (ctx: LiteralContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.propertyName`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPropertyName?: (ctx: PropertyNameContext) => Result;

	/**
	 * Visit a parse tree produced by `mongoParser.numericLiteral`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumericLiteral?: (ctx: NumericLiteralContext) => Result;
}
