import { Input, Stack } from "@chakra-ui/react";
import { SearchBar } from "../custom/search-bar/Searchbar";

import { useState } from "react";
import DatePicker from "../custom/datepicker/DatePicker";

export default function Home() {
    const [date, setDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    return (
        <>
            <DatePicker selectedDate={date} onChange={setDate} />
            <div>{date.toISOString()}</div>
            <Stack spacing={3}>
            <DatePicker selectedDate={endDate} onChange={setEndDate} />
                <Input placeholder="extra small size" size="xs" />
                <Input placeholder="small size" size="sm" />
                <Input placeholder="medium size" size="md" />
                <Input placeholder="large size" size="lg" />
            </Stack>
            <h1>wdcujhwcfkuewhc</h1>
            <p>jicoiffffffffffffff</p>
            <SearchBar />
            <Input placeholder='Select Date and Time' size='md' type='date' />
            <Input placeholder='Select Date and Time' size='md' type='file' />
            <Input placeholder='Select Date and Time' size='md' type='search' />
            <Input placeholder='Select Date and Time' size='md' type='color' />
        </>
    );
}
