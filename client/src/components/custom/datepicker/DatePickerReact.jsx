import React, { forwardRef } from "react"
import ReactDatePicker from "react-datepicker"
// import { useColorMode } from "@chakra-ui/react";
import { InputGroup, Input, InputRightElement } from "@chakra-ui/react"
import { FaCalendarDays } from "react-icons/fa6";
import bg from 'date-fns/locale/bg';

import "react-datepicker/dist/react-datepicker.css"
import "./chakra-react-datepicker.css"

const customDateInput = ({ value, onClick, onChange }, ref) => (
  <Input
    autoComplete="off"
    background="white"
    value={value}
    ref={ref}
    onClick={onClick}
    onChange={onChange}
  />
)
customDateInput.displayName = "DateInput"

const CustomInput = forwardRef(customDateInput)

const icon = <FaCalendarDays fontSize="sm" />

const DatePicker2 = ({ selectedDate, onChange, ...props }) => {
  return (
    <>
      <InputGroup>
        <ReactDatePicker
          selected={selectedDate}
          onChange={onChange}
          className="react-datapicker__input-text"
          customInput={<CustomInput />}
          dateFormat="dd/MM/yyyy"
          locale={bg}
          {...props}
        />
        <InputRightElement color="gray.500" children={icon} />
      </InputGroup>
    </>
  )
}

export default DatePicker2
