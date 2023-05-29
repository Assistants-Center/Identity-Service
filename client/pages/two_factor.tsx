import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { IUser } from "../../src/types/user";

export const getServerSideProps: GetServerSideProps<{
  user: IUser;
}> = async (context) => {
  return {
    props: {
      user: JSON.parse(
        JSON.stringify(context.query["user"])
      ) as unknown as IUser,
    },
  };
};

const TwoFactorPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
      <p>
        {user.username}, to access your account, please enter your 2FA Code.
      </p>

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
