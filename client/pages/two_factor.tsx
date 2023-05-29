import React, { useState } from "react";
import axios, { AxiosError } from "axios";

const TwoFactorPage = () => {
  const [code, setCode] = useState("");

  const handleConfirm = async () => {
    try {
      await axios.post<never>("/api/auth/2fa/verify", {
        code,
      });
      location.href = "/request";
    } catch (err) {
      console.error((err as AxiosError).response);
    }
  };

  return (
    <div>
      <h1>Two Factor Code</h1>

      <input
        type="text"
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
};

export default TwoFactorPage;
