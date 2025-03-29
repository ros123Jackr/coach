import { heading } from '@/utils/heading';
import { checkMemoryExists } from '@/utils/memory/check-memory-exist';
import { MEMORYSETS } from '@/utils/memory/constants';
import {
	cosineSimilaritySearch,
	getDocumentsFromMemory
} from '@/utils/memory/db/lib';
import color from 'picocolors';
// import { generateLocalEmbeddings } from '@/utils/memory/generate-local-embeddings';
import { getOpenAIEmbeddings } from '@/utils/memory/generate-openai-embeddings';
import { validateMemoryName } from '@/utils/memory/lib';
import * as p from '@clack/prompts';
import { generateLocalEmbeddings } from '@/utils/memory/generate-local-embeddings';
import { loadConfig } from '@/utils/config/config-handler';
import { dlog } from '@/dev/utils/dlog';

export async function retrieveMemory({
	memory,
	query
}: {
	memory: string;
	query: string;
}) {
	p.intro(
		heading({
			text: 'RETRIEVE',
			sub: 'Retrieve similar chunks of a memory'
		})
	);

	// Spinner to show current action.
	var spin = p.spinner();

	try {
		if (!memory) {
			p.log.error(
				'Memory name is required. Use --memory or -m flag to specify.'
			);
			process.exit(1);
		}

		if (!query) {
			p.log.error(
				'Query is required. Use --query, or -q flag to specify.'
			);
			process.exit(1);
		}

		// 1- Check memory exists.
		var memoryName = validateMemoryName(memory); // Throws error if invalid so no need to check success
		await checkMemoryExists(memoryName);

		// 2- Load memory data.
		spin.start('Processing memory data...');
		var memoryChunks = await getDocumentsFromMemory([memory]);
		if (memoryChunks.length === 0)
			return p.log.error(
				'Please make sure the memory has one or more documents and they are embedded.'
			);

		// 3- Generate embeddings of query
		spin.message('Generating embeddings...');

		// Read config to determine which embedding to use.
		var config = await loadConfig();
		var useLocalEmbeddings = config.memory?.useLocalEmbeddings || false;

		let queryEmbedding = [];
		if (useLocalEmbeddings) {
			// Use local embeddings
			dlog('Generating local embeddings');
			queryEmbedding = await generateLocalEmbeddings([query]);
		} else {
			// Use OpenAI embeddings
			dlog('Generating OpenAI embeddings');
			queryEmbedding = await getOpenAIEmbeddings([query]);
		}

		// 4- Get similar chunks from the memorysets.
		spin.message('Searching for similar chunks...');
		var similarChunks = cosineSimilaritySearch({
			chunks: memoryChunks,
			queryEmbedding: queryEmbedding[0].embedding,
			topK: MEMORYSETS.MAX_CHUNKS_ATTACHED_TO_LLM
		});

		if (similarChunks.length === 0)
			return p.log.message('No similar chunks found.');

		// 5- Log the similar chunks
		p.log.info('Similar Chunks:');
		similarChunks.forEach((chunk, index) => {
			var header = color.cyan(color.bold(`#${index + 1}`));
			var similarity = `Similarity: ${color.green(chunk.similarity.toFixed(6))}`;
			var source = `Source: ${chunk.attributes.docName}`;
			var text = chunk.text;

			p.note(`${header}\n${similarity}\n${source}`);
			p.log.message(`${color.cyan(`Text Chunk:`)}\n${text}\n`);
		});

		p.outro('Memory retrieval completed successfully.');
	} catch (error: any) {
		p.cancel(`FAILED: ${error.message}`);
	} finally {
		spin.stop('Finished');
	}
}
