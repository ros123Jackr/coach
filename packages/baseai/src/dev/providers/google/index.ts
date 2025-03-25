import type { ProviderConfigs } from 'types/providers';
import GoogleApiConfig from './api';
import {
	GoogleChatCompleteConfig,
	GoogleChatCompleteResponseTransform,
	GoogleChatCompleteStreamChunkTransform
} from './chatComplete';

const GoogleConfig: ProviderConfigs = {
	api: GoogleApiConfig,
	chatComplete: GoogleChatCompleteConfig,
	responseTransforms: {
		chatComplete: GoogleChatCompleteResponseTransform,
		'stream-chatComplete': GoogleChatCompleteStreamChunkTransform
	}
};

export default GoogleConfig;
