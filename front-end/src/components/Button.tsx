import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    text: string,
    children?: ReactNode,
    variant: string,
    size?: string,
    extraClasses?: string | ''
}

const Button = ({ children, text, variant, extraClasses, ...props }: ButtonProps) => {

    const primaryType = "bg-green-600 text-white hover:bg-green-700";
    const secondaryType = "text-gray-600 border-1 border-gray-600 hover:bg-gray-600 hover:text-white";
    const primaryOutlineType = "text-green-600 border-1 border-green-600 hover:bg-green-600 hover:text-white";

    let type;

    switch (variant) {
        case "primary":
            type = primaryType;
            break;
        case "secondary":
            type = secondaryType;
            break;
        case "primary-outline":
            type = primaryOutlineType
            break;
        default:
            break;
    }

    return (
        <button {...props}
            className={` ${type} inline-flex gap-1 border-1 rounded-sm py-1 px-2 hover:cursor-pointer ${extraClasses}`}>
            {children}
            <span className="w-full">{text}</span>
        </button>
    )
}

export default Button;