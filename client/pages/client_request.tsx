import React from "react";
import { IUser } from "../../src/types/user";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { IClient } from "../../src/types/client";

export const getServerSideProps: GetServerSideProps<{
  user: IUser;
  client: IClient;
  redirect_uri: string;
}> = async (context) => {
  return {
    props: {
      user: JSON.parse(
        JSON.stringify(context.query["user"])
      ) as unknown as IUser,
      client: JSON.parse(
        JSON.stringify(context.query["client"])
      ) as unknown as IClient,
      redirect_uri: context.query["redirect_uri"] as string,
    },
  };
};

const ClientRequestPage = ({
  user,
  client,
  redirect_uri,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div>
      <h1>Client Request</h1>
      <h2>Hello, {user.username}</h2>
      <h2>
        A client with {client.id} id and {client.name} name has requested access
        to your account. You will be redirected to {redirect_uri} url. Scopes
        requested: {client.scopes.join(", ")}
      </h2>

      <p>
        User consent is{" "}
        {client.user_consent_required ? "required" : "not required"}
      </p>
    </div>
  );
};

export default ClientRequestPage;
