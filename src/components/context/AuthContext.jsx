import { createContext, useState, useEffect} from "react";

export const AuthContext = createContext();

export function AuthProvider({ children}) {
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("myapp_aceess_token");
        if (token) setAccessToken(token);
    }, []);

    return (
    <AuthContext.Provider value={{ accessToken, setAccessToken}}>
        {children}
    </AuthContext.Provider>
    );
}