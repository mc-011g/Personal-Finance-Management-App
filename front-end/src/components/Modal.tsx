import { XMarkIcon } from "@heroicons/react/24/solid";
import Button from "./Button";

interface ModalProps {
    title: string,
    content: React.ReactNode,
    submitAction: React.SubmitEventHandler<HTMLFormElement>,
    closeModal: React.MouseEventHandler<HTMLButtonElement | HTMLDivElement>
    error: string | null
}


const Modal = ({ title, content, submitAction, closeModal, error }: ModalProps) => {

    return (
        <div className="flex z-100 justify-center items-center fixed inset-0 bg-black/60" onClick={closeModal}>

            <form className="flex flex-col w-full sm:w-96 sm:h-128 h-full sm:h-max-128 sm:rounded-sm bg-white p-4" onSubmit={submitAction} onClick={e => e.stopPropagation()}>

                <div className="inline-flex justify-between items-center w-full border-b-1 border-gray-400 mb-4">
                    <p className="text-lg md:text-xl lg:text-2xl font-bold">{title}</p>
                    <button type="button" className="hover:cursor-pointer" onClick={closeModal}>
                        <XMarkIcon className="size-6" />
                    </button>
                </div>

                <div className="flex flex-col justify-between h-full overflow-y-auto">
                    {content}

                    <div>
                        {error &&
                            <span className="text-red-600">{error}</span>
                        }

                        <div className="inline-flex gap-2 pt-4 justify-end w-full">
                            <Button variant="secondary" text="Cancel" type="button" onClick={closeModal} />
                            <Button variant="primary" text="Submit" type="submit" />
                        </div>
                    </div>

                </div>
            </form>

        </div>
    )

}

export default Modal;