// Provider.js
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { system } from "./theme";

export function Provider({ children }) {
  return (
    <NextThemesProvider attribute="class">
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </NextThemesProvider>
  );
}
