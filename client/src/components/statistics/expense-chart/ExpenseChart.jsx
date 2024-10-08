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
import { Box, Stack, Text } from "@chakra-ui/react";

// Registering the required components for Chart.js
ChartJS.register(
    CategoryScale, // For categorical x-axis
    LinearScale, // For numerical y-axis
    PointElement, // For points in charts like line charts
    LineElement, // For drawing lines between points in line charts
    Title, // For adding titles to the charts
    Tooltip, // For showing tooltips when hovering over data points
    Legend, // For displaying legends in charts
    Filler // For filling the area under the line in line charts
);

export default function ExpenseChart({ data }) {
    if (data.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <p>
                    Няма налична информация за тенденции на разходите във
                    времето
                </p>
            </div>
        );
    }

    const chartData = {
        labels: data.map((item) => item.date),
        // datasets is an array of objects where each object represents a set of data to display
        // corresponding to the labels above.
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
        maintainAspectRatio: false, 
        plugins: {
            legend: {
                display: "false",
            },
            title: {
                display: true,
                font: {
                    size: 16,
                },
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
        <Stack>
            <Box
                height={{ lg: "400px" }}
                maxHeight={{ base: "350px", md: "400px", lg: "400px" }}
                width={{ lg: "740px" }}
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
            >
                <Line data={chartData} options={options} />
            </Box>
            <Text mb={4} fontSize="xs" color="gray.600">
                *Обща сума: Сумата на всички одобрени разходи за всеки месец,
                които попадат в избрания период.
            </Text>
        </Stack>
    );
}
