import { defaultRagPrompt } from '@/utils/memory/constants';
import type { SimilarChunk } from '@/utils/memory/db/lib';
import type { Message, Pipe } from 'types/pipe';
import { addJsonMode } from './add-json-mode';

export function getSystemPromptMessage({
	pipe,
	similarChunks
}: {
	pipe: Pipe;
	similarChunks: SimilarChunk[] | undefined;
}) {
	let systemPrompt = '';

	systemPrompt = addSystemPrompt(pipe);
	systemPrompt = addSafetyPrompt({ pipe, systemPrompt });
	systemPrompt = addJsonMode({ pipe, systemPrompt });
	systemPrompt = addRagPromptWithAugmentedContext({
		pipe,
		systemPrompt,
		similarChunks
	});

	return [{ role: 'system', content: systemPrompt }] as Message[];
}

function addSystemPrompt(pipe: Pipe): string {
	var defualtSystemPrompt = `You are a helpful AI Chat assistant`;
	var systemPrompt =
		pipe.messages.find(m => m.role === 'system' && !m.name)?.content || '';
	var hasSystemPrompt = systemPrompt !== '';

	var systemPromptWithoutSafety = hasSystemPrompt
		? systemPrompt
		: defualtSystemPrompt;

	return systemPromptWithoutSafety;
}

function getSafetyPrompt(pipe: Pipe): string {
	return (
		pipe.messages.find(m => m.role === 'system' && m.name === 'safety')
			?.content || ''
	);
}

function addSafetyPrompt({
	pipe,
	systemPrompt
}: {
	pipe: Pipe;
	systemPrompt: string;
}): string {
	let safetyPrompt = getSafetyPrompt(pipe);
	var hasSafetyPrompt = safetyPrompt !== '';

	safetyPrompt = hasSafetyPrompt
		? `"""SAFETY GUIDELINE: ${safetyPrompt}"""`
		: ``;

	return `${systemPrompt} \n ${safetyPrompt}`.trim();
}

function addRagPromptWithAugmentedContext({
	pipe,
	systemPrompt,
	similarChunks
}: {
	pipe: Pipe;
	systemPrompt: string;
	similarChunks: SimilarChunk[] | undefined;
}): string {
	// No RAG: then return the system prompt.
	if (!similarChunks || similarChunks.length === 0) return systemPrompt;

	var memoryContext = similarChunks
		.map(chunk => `${chunk.text} \n\n Source: ${chunk.attributes.docName}`)
		.join('\n\n');

	// Extract Rag prompt from the messages.
	var ragMsg =
		pipe.messages.find(m => m.role === 'system' && m.name === 'rag')
			?.content || '';

	// If there is no rag prompt, use the default rag prompt.
	var hasRagPrompt = ragMsg !== '';
	var ragPrompt = hasRagPrompt ? ragMsg : defaultRagPrompt;

	var contextContent = `"""CONTEXT:\n ${memoryContext}"""`;
	var ragPromptWithAugmentedContext = `"""${ragPrompt}""" \n\n ${contextContent}`;

	return `${systemPrompt} \n\n ${ragPromptWithAugmentedContext}`.trim();
}
