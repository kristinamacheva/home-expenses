import { useState } from "react";
import ExpenseListItem from "./expense-list-item/ExpenseListItem";
import { Stack } from "@chakra-ui/react";

export default function ExpenseList() {
    const userId = '1';

    const [expenses, setExpenses] = useState([
        {
            "_id": "1",
            "title": "Пазаруване в Лекси",
            "amount": 120,
            "split": "even",
            "paid": [{ "userId": "1", "sum": 120 }],
            "owed": [{ "userId": "1", "sum": 60 }, { "userId": "2", "sum": 60 }],
            "balance": [{ "userId": "1", "sum": 60, "type": "+" }, { "userId": "2", "sum": 60, "type": "-" }],
            "category": "Храна",
            "creator": [{ "userId": "1" }],
            "household": [{ "householdId": "1" }],
            "expenseDate": "01.05.2024",
        },
        {
            "_id": "2",
            "title": "Нова печка",
            "amount": 200,
            "split": "manual",
            "paid": [{ "userId": "2", "sum": 200 }],
            "owed": [{ "userId": "1", "sum": 150 }, { "userId": "2", "sum": 50 }],
            "balance": [{ "userId": "1", "sum": 150, "type": "-" }, { "userId": "2", "sum": 150, "type": "+" }],
            "category": "Уреди",
            "creator": [{ "userId": "2" }],
            "household": [{ "householdId": "1" }],
            "expenseDate": "06.05.2024",
        },
        {
            "_id": "3",
            "title": "Климатик за общата стая",
            "amount": 300,
            "split": "percent",
            "paid": [{ "userId": "1", "sum": 300 }],
            "owed": [{ "userId": "1", "sum": 150 }, { "userId": "2", "sum": 150 }],
            "balance": [{ "userId": "1", "sum": 150, "type": "+" }, { "userId": "2", "sum": 150, "type": "-" }],
            "category": "Уреди",
            "creator": [{ "userId": "1" }],
            "household": [{ "householdId": "1" }],
            "expenseDate": "08.05.2024",
        },

    ]);
    
    return (
        <Stack>
            {expenses.map(expense => (
                <ExpenseListItem key={expense._id} {...expense}/>
            ))}
        </Stack>
    );
}