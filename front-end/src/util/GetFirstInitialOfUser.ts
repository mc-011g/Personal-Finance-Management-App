const GetFirstInitialOfUser = ({ name }: { name: string }) => {
    const firstInitial = name.substring(0, 1).charAt(0);

    return firstInitial;
}

export default GetFirstInitialOfUser;