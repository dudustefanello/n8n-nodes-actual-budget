import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {
	budgetIdProperty,
	getAccounts,
	getBudgets,
	getCategories,
	getPayees,
	initializeActual,
	operationProperty,
} from './ActualBudget.utils';
import * as api from '@actual-app/api';

export class ActualBudgetTransactionNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Actual Budget Transaction',
		name: 'actualBudgetTransactionNode',
		group: ['transform'],
		version: 1,
		icon: { light: 'file:actual.png', dark: 'file:actual.png' },
		description: 'Actual Budget API Integration for n8n for list and create Transactions',
		defaults: {
			name: 'Actual Budget Transaction',
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
			budgetIdProperty,
			operationProperty,
			{
				displayName: 'Transaction ID',
				name: 'transactionId',
				type: 'string',
				default: '',
				description: 'ID of the transaction to update or delete',
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
					},
				},
			},
			{
				displayName: 'Account Name or ID',
				name: 'accountId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
				},
				default: '',
				description:
					'ID of the account for the transaction. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Date',
				name: 'date',
				type: 'string',
				default: '',
				description:
					'Date of the transaction in YYYY-MM-DD format. Defaults to today if not provided.',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				default: 0,
				description: 'Amount of the transaction',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Description of the transaction',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Category Name or ID',
				name: 'categoryId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCategories',
				},
				default: '',
				description:
					'ID of the category for the transaction. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: 'Payee Name or ID',
				name: 'payeeId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPayees',
				},
				default: '',
				description:
					'ID of the payee for the transaction. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			getBudgets,
			getAccounts,
			getCategories,
			getPayees,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const operation = this.getNodeParameter('operation', 0) as string;
		if (operation === 'list') {
			return [[{ json: { error: 'List operation is not implemented yet' } }]];
		} else if (operation === 'create') {
			await initializeActual(this);
			const transaction = getTransaction(this);
			await api.addTransactions(transaction.accountId, transaction.transactions);
			await api.sync();
			return [[{ json: { success: 'ok' } }]];
		} else if (operation === 'update') {
			return [[{ json: { error: 'Update operation is not implemented yet' } }]];
		} else if (operation === 'delete') {
			return [[{ json: { error: 'Delete operation is not implemented yet' } }]];
		}

		return [items];
	}
}

function getTransaction(exec: IExecuteFunctions) {
	const accountId = exec.getNodeParameter('accountId', 0, null) as string;
	let date = exec.getNodeParameter('date', 0, '') as string;
	if (!isDate(date)) {
		const now = new Date();
		date = now.toISOString().slice(0, 10);
	}
	const amount = exec.getNodeParameter('amount', 0, 0) as number;
	const notes = exec.getNodeParameter('notes', 0, '') as string;
	const category = exec.getNodeParameter('categoryId', 0, null) as string;
	let payeeName: string | undefined;
	let payee: string | undefined = exec.getNodeParameter('payeeId', 0, null) as string;
	if (!isUuid(payee)) {
		payeeName = payee;
		payee = undefined;
	}
	return {
		accountId,
		transactions: [
			{
				account: accountId,
				date,
				amount,
				payee: payee,
				payee_name: payeeName,
				category,
				notes,
			},
		],
	};
}

function isUuid(value: string | null | undefined): boolean {
	if (!value) return false;
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

function isDate(value: string | null | undefined): boolean {
	if (!value) return false;
	const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
	return dateRegex.test(value);
}
