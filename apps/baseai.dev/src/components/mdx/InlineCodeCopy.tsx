'use client';

import {
	ClipboardDocumentCheckIcon,
	DocumentDuplicateIcon
} from '@heroicons/react/24/solid';
import { Button } from '../ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import cn from 'mxcn';

export function InlineCopy({
	content,
	children
}: {
	content: string;
	children: React.ReactNode;
}) {
	const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
	const totalChars = content.length;

	const onCopy = () => {
		navigator.clipboard.writeText(content);
		if (isCopied) return;
		copyToClipboard(content);
	};

	return (
		<span className="inline-flex items-center gap-1 whitespace-nowrap">
			<code className={cn(totalChars > 25 && 'w-[50%] sm:w-full overflow-scroll')}>{content}</code>
			<Button
				variant="ghost"
				className="h-4 w-4 p-0 focus:ring-0"
				size="icon"
				onClick={onCopy}
			>
				{isCopied ? (
					<ClipboardDocumentCheckIcon className="w-4" />
				) : (
					<DocumentDuplicateIcon className="w-4" />
				)}
				<span className="sr-only">Copy</span>
			</Button>
		</span>
	);
}
