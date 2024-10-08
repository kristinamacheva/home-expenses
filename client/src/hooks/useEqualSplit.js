import { useState, useEffect } from "react";

export default function useEqualSplit(totalAmount, members, onUpdate) {
    const [equalSplit, setEqualSplit] = useState([]);

    const calculateEqualSplit = () => {
        const totalAmountInSubunits = Math.round(Number(totalAmount) * 100);
        const numberOfPeople = members.length;

        const amountPerPersonInCents = Math.floor(
            totalAmountInSubunits / numberOfPeople
        );
        let remainderInCents = totalAmountInSubunits % numberOfPeople;

        const updatedMembers = members.map((member) => {
            const amount = amountPerPersonInCents + (remainderInCents > 0 ? 1 : 0);
            remainderInCents--; 
            return {
                ...member,
                sum: Number((amount / 100).toFixed(2)),
            };
        });

        setEqualSplit(updatedMembers);

        onUpdate(updatedMembers);
    };

    useEffect(() => {
        calculateEqualSplit();
    }, [totalAmount, members]);

    return equalSplit;
}
