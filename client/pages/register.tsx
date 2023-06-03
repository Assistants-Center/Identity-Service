import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SocialType } from "../../src/services/session";
import { Exception } from "../../src/utils/http_exceptions";

export const getServerSideProps: GetServerSideProps<{
  social_type: SocialType | null;
  social_user: string | null;
}> = async (context) => {
  return {
    props: {
      social_type: (context.query["social_type"] as SocialType) || null,
      social_user: (context.query["social_user"] as string) || null,
    },
  };
};

const RegisterPage = ({
  social_type,
  social_user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post<undefined | Exception>(
        `/api/auth/register${social_type && "/social"}`,
        social_type
          ? {
              username,
              email,
            }
          : {
              username,
              email,
              password,
            }
      );

      location.href = "/request";
    } catch (err) {
      const error = (err as AxiosError<Exception>).response?.data;
      console.error(error);
    }
  };

  return (
    <div>
      <h1>
        {social_type ? "Complete the information required" : "Create Account"}
      </h1>

      {social_type && (
        <p>
          To complete the registration, you need to set up some additional data.
        </p>
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleRegister}>Create account</button>
      {social_type && (
        <>
          <p>
            Your account will be associated with your {social_type} account from
            the previous step (ID: {social_user}).
          </p>

          <button onClick={() => (location.href = "/api/auth/destroy-user")}>
            Cancel?
          </button>
        </>
      )}

      <a href={"/cancel"}>
        Want to cancel the registration and client identity session?
      </a>
    </div>
  );
};

export default RegisterPage;
