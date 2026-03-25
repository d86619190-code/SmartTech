import * as React from "react";

export type AuthByEmailState = {
  email: string;
  password: string;
  isSubmitting: boolean;
};

export function useAuthByEmail(onSubmit?: (payload: { email: string; password: string }) => void | Promise<void>) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit?.({ email, password });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, onSubmit]
  );

  return {
    email,
    password,
    isSubmitting,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
