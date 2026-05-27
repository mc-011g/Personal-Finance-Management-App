import { useContext, useEffect, useState } from "react";
import type { CategoryType, TransactionType, BudgetType, FinancialAccountType } from "../types";
import { BankAccountsSetup } from "../components/BankAccountsSetup";
import { CategoriesSetup } from "../components/CategoriesSetup";
import { BudgetsSetup } from "../components/BudgetsSetup";
import { TransactionsSetup } from "../components/TransactionsSetup";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { authClient } from "../lib/auth";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";

export const AccountSetup = () => {

    const [step, setStep] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const authContext = useContext(AuthContext);
    const token = authContext?.session?.token;
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            return;
        }

        const checkIsSetupComplete = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/setup/complete-status`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data === true) {
                    navigate('/');
                    return;
                }      
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data || error.message);
                    return;
                } else {
                    setError("An unexpected error occurred");
                    return;
                }
            }
        }
        checkIsSetupComplete();
    }, [token, navigate]);

    const [budgetsSkipped, setBudgetsSkipped] = useState<boolean>(false);
    const [transactionsSkipped, setTransactionsSkipped] = useState<boolean>(false);

    const [bankAccounts, setBankAccounts] = useState<FinancialAccountType[]>([
        {
            id: "1",
            name: "",
            balance: 0
        }
    ]);
    const [categories, setCategories] = useState<CategoryType[]>([
        {
            id: "1",
            name: ""
        }
    ])
    const [budgets, setBudgets] = useState<BudgetType[]>([
        {
            id: "1",
            amount: 0,
            name: "",
            categoryIds: []
        }
    ])
    const [transactions, setTransactions] = useState<TransactionType[]>([
        {
            id: "1",
            amount: 0,
            date: (new Date()).toLocaleDateString(),
            name: "",
            categoryId: "",
            financialAccountId: ""
        }
    ])

    const handleLogout = async () => {
        await authClient.signOut();
        authContext?.setSession(null);
        authContext?.setUser(null);
    }

    const handleFinishSetup = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/setup`,
                {
                    categoryDTOs: categories,
                    transactionDTOs: transactionsSkipped ? null : transactions,
                    financialAccountDTOs: bankAccounts,
                    budgetDTOs: budgetsSkipped ? null : budgets
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            navigate('/');  
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
                return;
            } else {
                setError("An unexpected error occurred.");
                return;
            }
        }
    }

    const handleGoToNextStep = () => {     
     
        switch (step) {
            case 1: {
                //Financial Accounts  

                for (const account of bankAccounts) {
                    if (account.name === "" || !account.name) {
                        setError("Please enter a name for each bank account.");
                        return;
                    }
                }
      
                const bankAccountNames = bankAccounts.map(account => account.name.trim().toLowerCase());
                const uniqueBankAccountNames = new Set(bankAccountNames);
                if (uniqueBankAccountNames.size !== bankAccountNames.length) {
                    setError("Please enter a different name for each bank account.");
                    return;
                }

                break;
            }
            case 2: {
                //Categories       
          
                for (const category of categories) {
                    if (category.name === "" || !category.name) {
                        setError("Please enter a name for each category");
                        return;
                    }
                }
         
                const categoryNames = categories.map(category => category.name.trim().toLowerCase());
                const uniqueCategoryNames = new Set(categoryNames);
                if (uniqueCategoryNames.size !== categoryNames.length) {
                    setError("Please enter a different name for each category.");
                    return;
                }

                break;
            }
            case 3: {
                //Budgets        

                if (budgets.length === 1 && (
                    (!budgets[0].name || budgets[0].name.length === 0) &&
                    (!budgets[0].categoryIds || budgets[0].categoryIds.length === 0) &&
                    (!budgets[0].amount || budgets[0].amount === 0)
                )) {              
               
                    setBudgetsSkipped(true);
                    setStep(step + 1);       
                    return;
                }
          
                for (const budget of budgets) {
                    if (budget.name === "" || !budget.name) {
                        setError("Please enter a name for each budget");
                        return;
                    }
                }
 
                for (const category of categories) {
                    if (category.name === "" || !category.name) {
                        setError("Please enter an amount greater than 0 for each budget.");
                        return;
                    }
                }

                for (const budget of budgets) {
                    if (budget.amount === 0 || !budget.amount) {
                        setError("Please enter an amount greater than 0 for each budget.");
                        return;
                    }
                }

                for (const budget of budgets) {
                    if (budget.categoryNames?.length === 0 || !budget.categoryNames) {
                        setError("Please select at least one category for each budget.");
                        return;
                    }
                }
    
                const budgetNames = budgets.map(budget => budget.name.trim().toLowerCase());
                const uniqueBudgetNames = new Set(budgetNames);
                if (uniqueBudgetNames.size !== budgetNames.length) {
                    setError("Please enter a different name for each budget.");
                    return;
                }

                setBudgetsSkipped(false);
                break;
            }
            case 4: {       
                //Transactions

                if (transactions.length === 1 && (
                    (!transactions[0].name || transactions[0].name.length === 0) &&
                    (!transactions[0].financialAccountId || transactions[0].financialAccountId.length === 0) &&
                    (!transactions[0].categoryId || transactions[0].categoryId.length === 0)
                )) {           
                    setTransactionsSkipped(true);
                    handleFinishSetup();
                    return;
                }

                for (const transaction of transactions) {
                    if (!transaction.name) {
                        setError("Please enter a name.");
                        return;
                    }
                    if (!transaction.date) {
                        setError("Please select a date.");
                        return;
                    }
                    if (!transaction.categoryId) {
                        setError("Please select a category.");
                        return;
                    }
                    if (!transaction.financialAccountId) {
                        setError("Please select a financial account.");
                        return;
                    }
                }
        
                setTransactionsSkipped(false);
                handleFinishSetup();
                break;
            }
            default:
                break;
        }
        if (step !== 4) {
            setStep(step + 1);
        }
        setError(null);
    }

    return (
        <div className="w-full h-screen flex flex-col p-8">
            <div className="mb-4 border-b-1 border-b-gray-400">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Account Setup</h1>
            </div>
      
            {step === 1 ?
                <BankAccountsSetup
                    bankAccounts={bankAccounts}
                    setBankAccounts={setBankAccounts}
                    step={step}
                    handleGoToNextStep={handleGoToNextStep}
                    error={error}
                    setError={setError}
                />

                : step === 2 ?
                    <CategoriesSetup
                        categories={categories}
                        setCategories={setCategories}
                        step={step}
                        handleGoToNextStep={handleGoToNextStep}
                        setStep={setStep}
                        error={error}
                        setError={setError}
                    />

                    : step === 3 ?
                        <BudgetsSetup
                            budgets={budgets}
                            setBudgets={setBudgets}
                            step={step}
                            categories={categories}
                            handleGoToNextStep={handleGoToNextStep}
                            setStep={setStep}
                            error={error}
                            setError={setError}
                        />

                        : step === 4 &&
                        <TransactionsSetup
                            transactions={transactions}
                            setTransactions={setTransactions}
                            step={step}
                            setStep={setStep}
                            handleGoToNextStep={handleGoToNextStep}
                            error={error}
                            categories={categories}
                            bankAccounts={bankAccounts}
                            setError={setError}
                        />
            }
            <button className="mt-auto inline-flex w-fit gap-2 items-center px-2 py-1 hover:cursor-pointer border-1 rounded-md border-red-600 text-red-600" onClick={() => handleLogout()}>
                <ArrowRightStartOnRectangleIcon className="size-4" /> Logout
            </button>
        </div>
    )
}