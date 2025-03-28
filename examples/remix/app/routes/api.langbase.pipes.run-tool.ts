import type {ActionFunction} from '@remix-run/node';
import getPipeWithTool from '~/../baseai/pipes/pipe-with-tool';
import {Pipe} from '@baseai/core';

export let action: ActionFunction = async ({request}) => {
	let runOptions = await request.json();

	// 1. Initiate the Pipe.
	let pipe = new Pipe(getPipeWithTool());

	// 2. Run the pipe with user messages and other run options.
	let result = await pipe.run(runOptions);

	// 2. Return the response stringified.
	return new Response(JSON.stringify(result));
};
