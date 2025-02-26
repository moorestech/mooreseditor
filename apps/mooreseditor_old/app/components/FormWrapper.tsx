import { Stack } from "@mantine/core";

import { FormLabel } from "./FormLabel";

interface Props {
  label?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}

export const FormWrapper = ({ label, description, children }: Props) => {
  return (
    <Stack gap="xs">
      <FormLabel label={label} description={description} />
      {children}
    </Stack>
  );
};
