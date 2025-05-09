import {
	ANTHROPIC,
	COHERE,
	FIREWORKS_AI,
	GOOGLE,
	GROQ,
	OLLAMA,
	OPEN_AI,
	PERPLEXITY,
	TOGETHER_AI,
	X_AI
} from '@/dev/data/models';

import { addContextFromMemory } from '@/utils/memory/lib';
import type { Message, Pipe, VariablesI } from 'types/pipe';
import { ApiError } from '../hono/errors';
import { dlog } from '../utils/dlog';
import { getRunThread } from '../utils/thread/get-run-thread';
import { callAnthropic } from './call-anthropic';
import { callCohere } from './call-cohere';
import { callFireworks } from './call-fireworks';
import { callGoogle } from './call-google';
import { callGroq } from './call-groq';
import { callOllama } from './call-ollama';
import { callOpenAI } from './call-openai';
import { callPerplexity } from './call-perplexity';
import { callTogether } from './call-together';
import { callXAI } from './call-xai';
import { getProvider } from '../utils/get-provider';
import type { PipeTool } from 'types/tools';

export async function callLLM({
	pipe,
	stream,
	messages,
	llmApiKey,
	variables,
	paramsTools
}: {
	pipe: Pipe;
	stream: boolean;
	llmApiKey: string;
	messages: Message[];
	variables?: VariablesI;
	paramsTools: PipeTool[] | undefined;
}) {
	try {
		// Get the model provider from the pipe.
		const providerString = pipe.model.split(':')[0];
		const modelProvider = getProvider(providerString);

		const memoryNames = pipe.memory.map(memory => memory.name);

		const similarChunks = await addContextFromMemory({
			messages,
			memoryNames
		});

		// Process the messages to be sent to the model provider.
		const messagesThread = getRunThread({
			pipe,
			messages,
			similarChunks,
			variables
		});
		messages = messagesThread;

		dlog('Messages for LLM', messages);

		if (modelProvider === OPEN_AI) {
			dlog('OPEN_AI', '✅');
			return await callOpenAI({
				pipe,
				stream,
				messages,
				llmApiKey,
				paramsTools
			});
		}

		if (modelProvider === ANTHROPIC) {
			dlog('ANTHROPIC', '✅');
			return await callAnthropic({
				pipe,
				stream,
				messages,
				llmApiKey,
				paramsTools
			});
		}

		if (modelProvider === TOGETHER_AI) {
			dlog('TOGETHER_AI', '✅');
			return await callTogether({
				pipe,
				stream,
				messages,
				llmApiKey,
				paramsTools,
			});
		}

		if (modelProvider === GROQ) {
			dlog('GROQ', '✅');
			return await callGroq({
				pipe,
				messages,
				llmApiKey,
				stream
			});
		}

		if (modelProvider === GOOGLE) {
			dlog('GOOGLE', '✅');
			return await callGoogle({
				pipe,
				messages,
				llmApiKey,
				stream,
				paramsTools
			});
		}

		if (modelProvider === X_AI) {
			dlog('XAI', '✅');
			return await callXAI({
				pipe,
				messages,
				llmApiKey,
				stream,
				paramsTools
			});
		}

		if (modelProvider === COHERE) {
			dlog('COHERE', '✅');
			return await callCohere({
				pipe,
				messages,
				llmApiKey,
				stream
			});
		}

		if (modelProvider === FIREWORKS_AI) {
			dlog('FIREWORKS_AI', '✅');
			return await callFireworks({
				pipe,
				messages,
				llmApiKey,
				stream
			});
		}

		if (modelProvider === PERPLEXITY) {
			dlog('PERPLEXITY', '✅');
			return await callPerplexity({
				pipe,
				messages,
				llmApiKey,
				stream
			});
		}

		if (modelProvider === OLLAMA) {
			dlog('OLLAMA', '✅');
			return await callOllama({
				pipe,
				messages,
				llmApiKey,
				stream
			});
		}

		throw new ApiError({
			status: 400,
			code: `BAD_REQUEST`,
			message: `Invalid model provider: ${modelProvider}`
		});
	} catch (error: any) {
		dlog('Error call-llm.ts:', error);

		// If the model provider is rate limited, throw an error.
		if (error.status === 429) {
			throw new ApiError({
				status: 429,
				code: `RATE_LIMITED`,
				message: `Rate limited by the model provider. Please try again later. ${error.message}`
			});
		}

		// Main catch will handle all other errors.
		throw new ApiError({
			status: error.status,
			code: error.code || 'INTERNAL_SERVER_ERROR',
			message: error.message
				? error.message
				: 'Error calling the model provider.'
		});
	}
}
