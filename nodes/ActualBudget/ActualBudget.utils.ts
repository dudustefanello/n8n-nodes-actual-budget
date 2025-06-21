import { IExecuteFunctions, ILoadOptionsFunctions, INodeProperties } from 'n8n-workflow';
import * as api from '@actual-app/api';
import * as os from 'os';

export const budgetIdProperty: INodeProperties = {
	displayName: 'Budget Name or ID',
	name: 'budgetId',
	type: 'options',
	description:
		'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	typeOptions: { loadOptionsMethod: 'getBudgets' },
	default: '',
	required: true,
};

export const operationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'List',
			value: 'list',
			description: 'List objects',
			action: 'List objects',
		},
		{
			name: 'Create',
			value: 'create',
			description: 'Create a new object',
			action: 'Create a new object',
		},
		{
			name: 'Update',
			value: 'update',
			description: 'Update a object',
			action: 'Update a object',
		},
		{
			name: 'Delete',
			value: 'delete',
			description: 'Delete a object',
			action: 'Delete a object',
		},
	],
	default: 'list',
	required: true,
};

let initializedPromise: Promise<void> | null = null;
let downloadedPromise: Promise<void> | null = null;

export async function initializeActual(options: ILoadOptionsFunctions | IExecuteFunctions) {
	if (!initializedPromise) {
		initializedPromise = (async () => {
			const credentials = await options.getCredentials('actualBudgetApi');
			const tempDir = os.tmpdir();
			await api.init({
				dataDir: tempDir,
				serverURL: credentials.serverUrl as string,
				password: credentials.password as string,
			});
		})();
	}
	await initializedPromise;

	if (!downloadedPromise) {
		downloadedPromise = (async () => {
			const parameter = options.getNodeParameter('budgetId', 0);
			if (parameter && parameter.valueOf()) {
				await api.downloadBudget(parameter.valueOf());
			}
		})();
	}
	await downloadedPromise;
}

export const getBudgets = async function (this: ILoadOptionsFunctions) {
	try {
		await initializeActual(this);
		let budgets = await api.getBudgets();
		return budgets
			.filter((budget: any) => budget.state == 'remote')
			.map((budget: any) => ({
				name: budget.name,
				value: budget.groupId,
			}));
	} catch (e) {
		console.warn('getBudgets', e);
		return [];
	}
};

export const getAccounts = async function (this: ILoadOptionsFunctions) {
	try {
		await initializeActual(this);
		let accounts = await api.getAccounts();
		accounts.push({ name: 'No account', id: '' });
		return accounts.map((account: any) => ({
			name: account.name,
			value: account.id,
		}));
	} catch (e) {
		console.warn('getAccounts', e);
		return [];
	}
};

export const getCategories = async function (this: ILoadOptionsFunctions) {
	try {
		await initializeActual(this);
		let categories = await api.getCategories();
		categories.push({ name: 'No category', id: '' });
		return categories.map((category: any) => ({
			name: category.name,
			value: category.id,
		}));
	} catch (e) {
		console.warn('getCategories', e);
		return [];
	}
};

export const getPayees = async function (this: ILoadOptionsFunctions) {
	try {
		await initializeActual(this);
		let payees = await api.getPayees();
		payees.push({ name: 'No payee', id: '' });
		console.log('getPayees', payees);
		return payees.map((payee: any) => ({
			name: (payee.transfer_acct ? 'Transfer: ' : '') + payee.name,
			value: payee.id,
		}));
	} catch (e) {
		console.warn('getPayees', e);
		return [];
	}
};
