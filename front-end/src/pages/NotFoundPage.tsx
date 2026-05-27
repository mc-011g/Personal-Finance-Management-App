import { Link } from "react-router";

export const NotFoundPage = () => {
    return (
        <div className="inset-0 w-screen h-screen flex flex-col gap-4 justify-center items-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Page Not Found</h1>
            <Link to={'/'} className="w-fit bg-green-600 text-white hover:cursor-pointer hover:bg-green-700 rounded-sm py-1 px-2 ">
                Go to Dashboard
            </Link>
        </div>
    )
}

export default NotFoundPage;