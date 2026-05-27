import { useState } from "react";
import Input from "./Input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = ({ ...props }: InputProps) => {

    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <div className="relative inline-flex items-center justify-items-end">
            <Input required maxLength={50} {...props} type={!showPassword ? 'password' : 'text'} extraClasses="pr-9 w-full" />

            <button className="absolute right-2 hover:cursor-pointer" type="button" onClick={() => setShowPassword(!showPassword)}>
                {!showPassword ?
                    <EyeIcon className="size-6" />
                    :
                    <EyeSlashIcon className="size-6" />
                }
            </button>      
      
        </div>
    )
}

export default PasswordInput;