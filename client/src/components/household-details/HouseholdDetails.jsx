import { useParams } from "react-router-dom";
import ExpenseList from "../expense-list/ExpenseList";

export default function HouseholdDetails() {
    const { householdId } = useParams();

    return (
        <>
            <p>HouseholdDetails { householdId }</p>
            <ExpenseList></ExpenseList>
        </>
    );
}