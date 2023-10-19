import { readyNostr } from "nip07-awaiter";
import { Container } from "@mantine/core";

await readyNostr;

export const IndexPage = () => {
  return <Container></Container>;
};
