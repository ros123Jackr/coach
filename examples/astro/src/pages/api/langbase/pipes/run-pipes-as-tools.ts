import {mapMetaEnvToProcessEnv} from './../../../../lib/utils';
import getPipeWithPipesAsTools from '../../../../../baseai/pipes/pipe-with-pipes-as-tools';
import {Pipe} from '@baseai/core';
import type {APIRoute} from 'astro';

export let POST: APIRoute = async ({request}) => {
	let runOptions = await request.json();

	// 1. Initiate the Pipe.
	let pipe = new Pipe(getPipeWithPipesAsTools());

	// 2. Run the pipe
	let result = await pipe.run(runOptions);

	// 3. Return the response stringified.
	return new Response(JSON.stringify(result));
};
