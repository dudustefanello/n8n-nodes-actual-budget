import { ICredentialType, INodeProperties } from 'n8n-workflow'


export class ActualBudgetApi implements ICredentialType {
	name = 'actualBudgetApi'
	displayName = 'Actual Budget API'
	documentationUrl = 'https://actualbudget.org/docs/api/'
	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'http://localhost:5006',
			placeholder: 'http://localhost:5006',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	]
}
