import { useParams } from "react-router-dom";

export default function ExpenseDetails() {
    const { expenseId } = useParams();

    return (
        <p>ExpenseDetails {expenseId}</p>
    );
}