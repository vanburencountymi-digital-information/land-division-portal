// theme.js
import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Your Custom Font', sans-serif" },
        body: { value: "'Your Custom Font', sans-serif" },
      },
      colors: {
        brand: {
          100: { value: '#f7fafc' },
          900: { value: '#1a202c' },
        },
      },
      // You can add other tokens such as spacing, sizes, etc.
    },
  },
});
