import React, { useState } from "react";
import axios, { AxiosError } from "axios";

const LoginPage = () => {
  const [parameter, setParameter] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post<never>("/api/auth/login", {
        parameter,
        password,
      });

      location.href = "/request";
    } catch (err) {
      console.error((err as AxiosError).response);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        type="text"
        placeholder="Parameter"
        value={parameter}
        onChange={(e) => setParameter(e.target.value)}
      />

      <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={() => (location.href = "/api/auth/discord")}>
        Continue with Discord
      </button>

      <a href={"/api/auth/destroy-client-session"}>
        Want to cancel the client identity session?
      </a>
    </div>
  );
};

export default LoginPage;
