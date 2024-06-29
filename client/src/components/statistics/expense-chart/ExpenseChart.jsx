import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Box, Text } from "@chakra-ui/react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ExpenseChart({ data }) {
    if (data.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Няма налична информация</p>
            </div>
        );
    }

    const chartData = {
        labels: data.map((item) => item.date),
        datasets: [
            {
                label: "Обща сума (лв.)",
                data: data.map((item) => item.amount),
                borderColor: "#2D3250",
                backgroundColor: "#676F9D",
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Тенденции на разходите във времето",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Период",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Обща сума*",
                },
            },
        },
    };

    return (
        <Box>
            <Line data={chartData} options={options} />
            <Text mb={4} fontSize="xs" color="gray.600">
                *Обща сума: Сумата на всички одобрени разходи за всеки месец, които попадат в избрания период.
            </Text>
        </Box>
    );
}
