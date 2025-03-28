import type { Message, Pipe } from 'types/pipe';

export function getPipeFewShotsMessages(pipe: Pipe): Message[] {
	let fewShotMessages: Message[] = pipe.messages.filter(
		m => m.role !== 'system'
	);

	if (fewShotMessages && fewShotMessages.length > 0) {
		return fewShotMessages;
	}

	return [];
}
