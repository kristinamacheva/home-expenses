import { CalendarIcon } from "@chakra-ui/icons";
import {
  InputGroup,
  Input,
  InputRightElement
} from "@chakra-ui/react";

const Input = (props) => {
  const { icon = <CalendarIcon fontSize="sm" /> } = props;

  return (
    <InputGroup>
      <Input background="white" />
      <InputRightElement color="gray.500" children={icon} />
    </InputGroup>
  );
};

export default Input;