import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Box, Stack, Text } from "@chakra-ui/react";

// Registering the required components for Chart.js
ChartJS.register(
    CategoryScale, // For categorical x-axis
    LinearScale, // For numerical y-axis
    ArcElement, // For doughnut and pie charts
    Title, // For adding titles to the charts
    Tooltip, // For showing tooltips when hovering over data points
    Legend // For displaying legends in charts
);

// Function to generate colors dynamically
// Generate a list of colors in HSL (Hue, Saturation, Lightness) format
const generateColors = (numColors) => {
    const colors = [];
    // Hue: Represents the type of color (0-360 degrees on the color wheel)
    const hueStep = 360 / numColors; // Spread hues evenly around the color wheel

    for (let i = 0; i < numColors; i++) {
        const hue = i * hueStep;
        const color = `hsl(${hue}, 60%, 66%)`; // HSL format: hue, saturation, lightness
        colors.push(color);
    }

    return colors;
};

export default function CategoryExpenseChart({ data }) {
    if (data.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <p>Няма налична информация за обща сума на разходите по категории</p>
            </div>
        );
    }

    const colors = generateColors(data.length);

    const chartData = {
        // category names
        labels: data.map((item) => item.category),
        datasets: [
            {
                label: "Обща сума по категории (лв.)",
                // total amount per category
                data: data.map((item) => item.totalAmount),
                backgroundColor: colors,
                hoverBackgroundColor: colors,
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
                text: "Обща сума на разходите по категории",
            },
        },
    };

    return (
        <Stack>
            <Box
                maxHeight={{ base: "350px", md: "450px", lg: "500px" }}
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
                p={4}
            >
                <Doughnut data={chartData} options={options} />
            </Box>
            <Text mb={4} fontSize="xs" color="gray.600">
                *Обща сума: Сумата на всички одобрени разходи по категории за избрания период.
            </Text>
        </Stack>
    );
}
