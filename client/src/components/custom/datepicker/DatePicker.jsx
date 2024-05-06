import React, { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import { Input } from "@chakra-ui/react";
import bg from "date-fns/locale/bg";

import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

const customDateInput = ({ value, onClick, onChange }, ref) => (
    <Input
        autoComplete="off"
        // background="white"
        value={value}
        ref={ref}
        onClick={onClick}
        onChange={onChange}
    />
);
customDateInput.displayName = "DateInput";

const CustomInput = forwardRef(customDateInput);

export default function DatePicker({ selectedDate, onChange, ...props }) {
    return (
        <ReactDatePicker
            selected={selectedDate}
            onChange={onChange}
            className="react-datapicker__input-text"
            customInput={<CustomInput />}
            dateFormat="dd/MM/yyyy"
            locale={bg}
            {...props}
        />
    );
}
