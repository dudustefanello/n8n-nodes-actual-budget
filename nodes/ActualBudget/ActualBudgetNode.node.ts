import {
	ILoadOptionsFunctions,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow'
import * as api from '@actual-app/api'

export class ActualBudget implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Actual Budget',
		name: 'actualBudgetNode',
		group: ['transform'],
		version: 1,
		description: 'Actual Budget API Integration for n8n',
		defaults: {
			name: 'Actual Budget',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'actualBudgetApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Budget Name or ID',
				name: 'budget',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: { loadOptionsMethod: 'getBudgets' },
				default: ''
			},
		],
	}

	methods = {
		loadOptions: {
			async getBudgets(this: ILoadOptionsFunctions) {
				const credentials = await this.getCredentials('actualBudgetApi')
				await api.init({
					serverURL: credentials.serverUrl as string,
					password: credentials.password as string,
				})
				let buds = await api.getBudgets()

				return buds.map((budget: any) => ({
					name: budget.name,
					value: budget.groupId,
				}))
			},
		},
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		return [items]
	}
}
