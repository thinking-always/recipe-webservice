import { AuthContext } from './authContext';
import { useContext } from 'react';

export function useApiFetch() {
    const API_URL = process.env.REACT_APP_API_URL;
    const { accessToken, setAccessToken } = useContext(AuthContext);

    const apiFetch = async (URL, options = {}) => {
        const headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };

        const res = await fetch(URL, {
            ...options,
            headers,
        });

        // Access Token 만료 -> Refresh 시도
        if (res.status === 401) {
            console.log("Access Token expired, trying to refresh...");
            const newAccessToken = await tryRefreshToken();
            if (newAccessToken) {
                //새 토큰으로 Authorization 헤더 갱신 후 재시도
                const retryRes = await fetch(URL, {
                    ...options,
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    },
                });
                return retryRes;
            } else {
                alert("session expired. login again");
                window.location.href = "/login";
            }
        }
        return res;
    };


    const tryRefreshToken = async () => {
        const refreshToken = localStorage.getItem("myapp_refresh_token");
        if (!refreshToken) return null;

        const res = await fetch(`${API_URL}/refresh`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("myapp_access_token", data.access_token);
            setAccessToken(data.access_token);
            return data.access_token;
        } else {
            return null;
        }
    };

    return apiFetch;
}