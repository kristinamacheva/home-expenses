import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        themeBlue: {
            900: "#2D3250",
            800: "#42466B",
            700: "#676F9D",
        },
        themeYellow: {
            900: "#F8B179",
        },
    },
    fonts: {
        body: "Raleway, sans-serif",
        heading: "Merriweather, serif",
    },
    components: {
        Button: {
            variants: {
                primary: {
                    bg: "themeBlue.700",
                    color: "white",
                    _hover: {
                        bg: "themeBlue.900",
                    },
                },
            },
        },
        Checkbox: {
            baseStyle: {
                control: {
                    _checked: {
                        bg: "themeBlue.700",
                        borderColor: "themeBlue.700",
                    },
                },
            },
        },
    },
});

export default function ThemeProvider({ children }) {
    return (
        <ChakraProvider theme={theme}>
            {children}
        </ChakraProvider>
    );
}

