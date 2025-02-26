import { ActionIcon, Box, Collapse, Group, Text } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { BsChevronDown, BsChevronRight } from "react-icons/bs"

interface Props {
  isOpenByDefault: boolean;
  label: string;
  children: React.ReactNode;
}

export const Summary = ({ isOpenByDefault, label, children }: Props) => {
  const [isOpen, { toggle }] = useDisclosure(isOpenByDefault)
  return (
    <Box>
      <Group wrap={'nowrap'} style={{ root: { flexWrap: 'nowrap' } }}>
        <ActionIcon size='xs' onClick={toggle}>
          {isOpen ? (
            <BsChevronDown />
          ) : (
            <BsChevronRight />
          )}
        </ActionIcon>
        <Text size='sm' fw='bold'>
          {label}
        </Text>
      </Group>
      <Collapse in={isOpen} pl='xl'>
        {children}
      </Collapse>
    </Box>
  )
}
