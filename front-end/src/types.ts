export interface TransactionType {
    id: string,
    name: string,
    amount: number,
    financialAccountId?: string
    date: string,
    financialAccountName?: string,
    categoryName?: string
    categoryId?: string
}

export interface CategoryType {
    id: string,
    name: string,  
}

export interface FinancialAccountType {
    id: string,
    name: string,
    balance: number
}

export interface UserType {
    id: string,
    email: string,
    firstName: string,
    lastName: string
}

export interface BudgetType {
    id: string,
    budgetPeriod?: string,
    name: string,
    amount: number,
    categoryIds?: string[]
    categoryDTOs?: {id: string, name: string}[],
    percentReached?: number,
    totalSpent?: number,
    categoryNames?: string[]
}

export interface Top5SpendingByCategoryByMonth {
    id: string,
    name: string,
    amount: number,
    color?: string,
    percentOfCircle?: number
}

export interface Top5SpendingByBudgetByMonth {
    id: string,
    name: string,
    amount: number,
    percentReached: number
}

export interface AccountBalance {
    id: string,
    name: string,
    balance: number
}