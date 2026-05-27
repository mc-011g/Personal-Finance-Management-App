import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid"
import type { CategoryType } from "../types"
import Button from "./Button"
import Input from "./Input"
import { useRef } from "react"

interface BankAccountsSetupProps {
    error: string | null,
    categories: CategoryType[],
    setCategories: React.Dispatch<React.SetStateAction<CategoryType[]>>,
    step: number,
    setStep: (step: number) => void,
    handleGoToNextStep: (direction: string) => void,
    setError: (error: string | null) => void
}

export const CategoriesSetup = ({ error, setError, handleGoToNextStep, categories, setCategories, step, setStep }: BankAccountsSetupProps) => {

    const nameInputRef = useRef<HTMLInputElement>(null);

    const handleAddNewCategory = () => {
        setCategories([...categories,
        {
            id: (categories.length + 1).toString(),
            name: "",
        }
        ])
    }

    const checkInputValidationBeforeNext = (direction: string) => {
        if (nameInputRef.current && !nameInputRef.current.checkValidity()) {
            nameInputRef.current.reportValidity();
            return;
        }
        handleGoToNextStep(direction);
    }

    const handleDeleteCategory = (id: string) => {   
        setCategories(prev => prev.filter(category => category.id !== id));
    }

    return (
        <div className="mx-auto flex flex-col">
            <div className="py-4 inline-flex justify-between gap-4">
                <h2 className="text-2xl md:text-xl lg:text-lg font-bold">Add Categories</h2>
                <h2 className="text-xl md:text-lg lg:text-md font-bold">Step {step} of 4</h2>
            </div>

            <div className="flex flex-col justify-between h-full">

                <div className="flex flex-col gap-4 w-full sm:w-96 md:w-128">
                    <p>Add categories for your transactions.</p>

                    {categories.map(category =>
                        <div key={category.id} className="relative p-4 border-1 border-gray-400 rounded-md flex flex-col gap-2">

                            {categories.at(0)?.id !== category.id &&
                                <button
                                    type="button"
                                    className="absolute top-4 right-4"
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    <XMarkIcon className="size-6 text-gray-600 hover:text-black hover:cursor-pointer" />
                                </button>
                            }

                            <label className="flex flex-col gap-2 items-baseline">
                                Name:
                                <Input ref={nameInputRef} required maxLength={50} type="text" extraClasses="w-full" placeholder="Name" value={category.name}
                                    onChange={e =>
                                        setCategories((prev: CategoryType[]) =>
                                            prev.map((prevCategory: CategoryType) =>
                                                prevCategory.id === category.id ?
                                                    { ...prevCategory, name: e.target.value } : prevCategory
                                            )
                                        )
                                    }
                                />
                            </label>
                        </div>
                    )}
                    {error &&
                        <div className="text-red-600">
                            {error}
                        </div>
                    }
                    <div>
                        <Button text="Add Another" type="button" variant="primary-outline" extraClasses="inline-flex items-center" onClick={() => handleAddNewCategory()}>
                            <PlusIcon className="size-6" />
                        </Button>
                    </div>
                </div>


                <div className="ml-auto pt-4 inline-flex gap-2">
                    {step > 1 &&
                        <div className="">
                            <Button text="Previous" variant="secondary" onClick={() => { setStep(step - 1); setError(null); }} />
                        </div>
                    }
                    <div className="">
                        <Button text="Next" variant="primary" onClick={() => checkInputValidationBeforeNext("next")} />
                    </div>

                </div>
            </div>
        </div>
    )
}