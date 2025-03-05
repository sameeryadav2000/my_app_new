// src/utils/federatedLogout.ts
import { signOut } from "next-auth/react";

export default async function federatedLogout() {
  try {
    const response = await fetch("/api/auth/federated_logout");

    const data = await response.json();
    console.log(data);

    if (data.success) {
      await signOut({ redirect: false });
      window.location.href = data.url;
      return;
    }

    throw new Error(data.error);
    
  } catch (error) {
    console.log(error);
    alert(error);
    await signOut({ redirect: false });
    window.location.href = "/";
  }
}
