const AuthLayout = ({children}: {
    children: React.ReactNode
}) => {
    return(
        <div className="bg-red-600 h-full flex items-center justify-center">
            {children}
        </div>
    )
}
export default AuthLayout