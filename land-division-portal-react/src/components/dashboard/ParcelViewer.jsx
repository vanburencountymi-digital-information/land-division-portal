import React, { useState } from 'react';
import { Box, Flex, Text, Spinner } from '@chakra-ui/react';
import { useTheme } from 'next-themes';

const ParcelViewer = ({ parcelNumber }) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const { theme } = useTheme();
  
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.200';
  const borderColor = theme === 'dark' ? 'gray.600' : 'gray.200';

  const BASE_URL = 'https://gis.vanburencountymi.gov/van-buren-county-mi/maps/139519/parcel-viewer';
  const LAYER_ID = 'fe8994c6-7719-11ee-9d4f-027d7e0bb32b';

  const getParcelViewerUrl = (parcelNumber) => {
    return `${BASE_URL}?field=parcel_no&value=${parcelNumber}&layer=${LAYER_ID}&preview=true`;
  };

  return (
    <Box position="relative" borderWidth="1px" borderColor={borderColor} borderRadius="md" overflow="hidden" height="600px">
      {/* Loading overlay - now always on top */}
      <Flex
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        align="center"
        justify="center"
        bg={bgColor}
        zIndex={iframeLoading ? "1" : "-1"}
        opacity={iframeLoading ? "1" : "0"}
        transition="opacity 0.3s"
        flexDir="column"
        p={4}
      >
        <Spinner size="lg" />
        <Text mt={2}>Loading parcel viewer...</Text>
      </Flex>

      <Box as="iframe"
        src={getParcelViewerUrl(parcelNumber)}
        allowTransparency="true"
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        width="100%"
        height="100%"
        style={{
          border: `1px solid ${borderColor}`,
          borderRadius: '4px',
        }}
        onLoad={(e) => {
          // Add a small delay to ensure content is actually loaded
          setTimeout(() => {
            setIframeLoading(false);
          }, 1500);
        }}
      />
    </Box>
  );
};

export default ParcelViewer;