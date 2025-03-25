import { MetaFunction } from '@remix-run/node';
import ChatSimple from '~/components/chat-simple';
import GoHome from '~/components/ui/go-home';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Simple Chat Pipe ⌘' },
		{ name: "description", content: "Chat with the AI agent" },
	];
};

export default function Page() {
	return (
		<div className="w-full max-w-md">
			<GoHome />

			<h1 className="text-2xl font-light text-gray-800 mb-1 text-center">
				`usePipe()`: Chat
			</h1>
			<p className="text-muted-foreground text-base font-light mb-20 text-center">
				Chat with the AI agent
			</p>
			<ChatSimple />
		</div>
	);
}
