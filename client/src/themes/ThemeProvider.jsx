import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        themeBlue: {
            900: "#2D3250",
            800: "#42466B",
            700: "#676F9D",
            400: "#c4cbf5",
            200: "#ebecf5",
        },
        themeYellow: {
            900: "#F8B179",
        },
    },
    fonts: {
        body: "Roboto, sans-serif",
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
                outline: {
                    color: "themeBlue.700",
                    borderColor: "themeBlue.700",
                    _hover: {
                        bg: "themeBlue.200",
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

