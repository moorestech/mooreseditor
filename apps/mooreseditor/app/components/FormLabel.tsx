import { ActionIcon, Group, Popover, Text } from "@mantine/core";
import { IoMdInformationCircleOutline } from "react-icons/io";

interface Props {
  label: React.ReactNode;
  description: string;
}

export const FormLabel = ({ label, description }: Props) => {
  return (
    <Group gap="xs" align="center">
      <Text size="sm">{label}</Text>
      {description != null && (
        <Popover>
          <Popover.Target>
            <ActionIcon size="xs" variant="transparent" color="dark.4">
              <IoMdInformationCircleOutline />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">{description}</Text>
          </Popover.Dropdown>
        </Popover>
      )}
    </Group>
  );
};
