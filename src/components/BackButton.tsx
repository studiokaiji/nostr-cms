import { ActionIcon } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <ActionIcon
      variant="transparent"
      size="lg"
      color="#000"
      onClick={() => navigate(-1)}
    >
      <IconArrowLeft size="lg" />
    </ActionIcon>
  );
};
