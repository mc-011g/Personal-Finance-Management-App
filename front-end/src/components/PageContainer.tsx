import type { ReactNode } from "react";

const PageContainer = ({ children }: { children: ReactNode }) => {

    return (
        <>
            <main className="flex w-full h-screen overflow-y-auto">
                <section className="bg-gray-50 flex flex-col relative grow w-full ">
                    {children}
                </section>
            </main>
        </>
    )
}

export default PageContainer;