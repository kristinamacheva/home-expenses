import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    colors: {
        themePurple: {
            900: "#2D3250",
            800: "#42466B",
            700: "#676F9D",
            400: "#c4cbf5",
            200: "#ebecf5",
        },
        themeYellow: {
            900: "#F8B179",
        },
        tabsPurple: {
            900: "#2D3250",
            800: "#42466B",
            100: "#c4cbf5",
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
                    bg: "themePurple.700",
                    color: "white",
                    _hover: {
                        bg: "themePurple.900",
                    },
                },
                outline: {
                    color: "themePurple.700",
                    borderColor: "themePurple.700",
                    _hover: {
                        bg: "themePurple.200",
                    },
                },
            },
        },
        Checkbox: {
            baseStyle: {
                control: {
                    _checked: {
                        bg: "themePurple.700",
                        borderColor: "themePurple.700",
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

