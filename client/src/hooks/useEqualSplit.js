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

        const updatedMembers = members.map((member) => ({
            ...member,
            sum: Number(
                (
                    (amountPerPersonInCents +
                        (remainderInCents-- > 0 ? 1 : 0)) /
                    100
                ).toFixed(2)
            ),
        }));

        setEqualSplit(updatedMembers);

        onUpdate(updatedMembers);
    };

    useEffect(() => {
        calculateEqualSplit();
    }, [totalAmount, members]);

    return equalSplit;
}
