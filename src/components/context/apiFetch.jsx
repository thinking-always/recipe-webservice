import { AuthContext } from './AuthContext';
import { useContext } from 'react';

export function useApiFetch() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { accessToken, setAccessToken } = useContext(AuthContext);

  const apiFetch = async (URL, options = {}) => {
    let headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    };

    // 만약 body가 FormData면 Content-Type 설정하지 않음
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(URL, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      console.log("Access Token expired, trying to refresh...");
      const newAccessToken = await tryRefreshToken();
      if (newAccessToken) {
        headers.Authorization = `Bearer ${newAccessToken}`;
        const retryRes = await fetch(URL, {
          ...options,
          headers,
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


