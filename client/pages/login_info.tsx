import React from "react";
import { IUser } from "../../src/types/user";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

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

const LoginInfoPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <h1>Login Info</h1>
      <h2>Hello, {user.username}</h2>
      <h2>Your password is {user.password}</h2>
      <h2>Your email is {user.email}</h2>
    </div>
  );
};

export default LoginInfoPage;
