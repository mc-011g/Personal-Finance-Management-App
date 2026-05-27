import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    extraClasses?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ extraClasses = "", ...props }, ref) => {

        return (
            <input
                ref={ref}
                {...props}
                className={`${extraClasses} border-1 border-gray-400 rounded-sm px-2 py-1 w-full`}
            />
        )
    }
);

export default Input;