import { useState, useEffect } from "react";

export default function useEqualSplit(totalAmount, members, onUpdate) {
    const [equalSplit, setEqualSplit] = useState([]);

    const calculateEqualSplit = () => {
        const totalAmountInSubunits = Math.round(Number(totalAmount) * 100);
        const numberOfPeople = members.length;

        // if (numberOfPeople === 0) {
        //     setEqualSplit([]);
        //     return;
        // }

        const amountPerPersonInCents = Math.floor(
            totalAmountInSubunits / numberOfPeople
        );
        let remainderInCents = totalAmountInSubunits % numberOfPeople;

        const updatedMembers = members.map((member) => ({
            ...member,
            sum: (
                (amountPerPersonInCents + (remainderInCents-- > 0 ? 1 : 0)) /
                100
            ).toFixed(2),
        }));

        // Create an array of objects with only `id` and `sum` properties
        const simplifiedMembers = updatedMembers.map((member) => ({
            _id: member._id,
            sum: member.sum,
        }));

        setEqualSplit(updatedMembers);
        onUpdate(simplifiedMembers);
    };

    useEffect(() => {
        calculateEqualSplit();
    }, [totalAmount, members]);

    return equalSplit;
}
