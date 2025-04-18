import { modelsByProvider } from '@/data/models';

export function hasToolSupport({
	provider,
	modelName
}: {
	modelName: string;
	provider: string;
}) {
	let toolSupportedModels = modelsByProvider[provider].filter(
		model => model.toolSupport
	);
	let hasToolCallSupport = toolSupportedModels
		.flatMap(model => model.id)
		.includes(modelName);

	return hasToolCallSupport;
}

export function getSupportedToolSettings({
	provider,
	modelName
}: {
	modelName: string;
	provider: string;
}) {
	let toolSupportedModels = modelsByProvider[provider].filter(
		model => model.toolSupport
	);
	let providerModel = toolSupportedModels.find(
		model => model.id === modelName
	);

	if (!providerModel) {
		return {
			hasParallelToolCallSupport: false,
			hasToolChoiceSupport: false
		};
	}

	return {
		hasToolChoiceSupport: providerModel.toolSupport?.toolChoice,
		hasParallelToolCallSupport: providerModel.toolSupport?.parallelToolCalls
	};
}
