import React from "react";

const InvalidClientPage = () => {
  return (
    <div>
      <h1>Client Died</h1>
      <p>
        Client id or redirect_uri is missing from your auth state. To log in to
        our services, you need to click the "Log in" button directly on one of
        the pages, do not enter identity.assistantscenter.com/login directly,
        because you will be missing the important client state.
      </p>
      <p>
        I don't even know where you're coming from here, so come back to our
        main page.
      </p>
    </div>
  );
};

export default InvalidClientPage;
