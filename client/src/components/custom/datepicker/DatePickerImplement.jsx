import { Box, Button, HStack, VStack } from "@chakra-ui/react"
import { useState } from "react"
import DatePicker from "./DatePicker"

export default function Datepicker () {
  const [date, setDate] = useState(new Date())

  return (
    <Box position="relative">
      <HStack>
        <VStack alignItems="flex-start">
          <DatePicker selectedDate={date} onChange={setDate} />
          <div>{date.toISOString()}</div>
        </VStack>
      </HStack>
    </Box>
  )
}
