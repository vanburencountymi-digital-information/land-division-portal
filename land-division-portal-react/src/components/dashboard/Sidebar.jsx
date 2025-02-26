import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  VStack,
  Heading,
  Text,
  Link,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemContent,
  AccordionRoot,
} from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { MdAddCircleOutline } from "react-icons/md";

const Sidebar = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme(); // Get current theme
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.100';
  const textColor = theme === 'dark' ? 'white' : 'black';

  return (
    <Box w="full" p={4} bg={bgColor} color={textColor} borderRadius="md">
      {/* Sidebar Header */}
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Land Division Guide
      </Heading>

      {/* FAQ Section */}
      <AccordionRoot defaultValue={[]} collapsible>
        {faqData.map(({ id, title, content, law }) => (
          <AccordionItem key={id} value={id}>
            <AccordionItemTrigger cursor="pointer">
              {title}
              <MdAddCircleOutline />
            </AccordionItemTrigger>
            <AccordionItemContent>
              <VStack align="start" spacing={2}>
                {content.map((text, i) => (
                  <Text key={i}>{text}</Text>
                ))}
                <Text fontWeight="bold">Relevant law: </Text>
                <Link href={law} isExternal color="blue.500">
                  View Legal Reference
                </Link>
              </VStack>
            </AccordionItemContent>
          </AccordionItem>
        ))}
      </AccordionRoot>

      {/* Contact Section */}
      <Box mt={6} textAlign="center">
        <Heading size="md" mb={2}>
          Need Help?
        </Heading>
        <Text>
          Contact the Van Buren County Digital Information Department:
        </Text>
        <Text>
          📧{' '}
          <Link href="mailto:gis@vanburencountymi.gov" color="blue.500">
            gis@vanburencountymi.gov
          </Link>
        </Text>
        <Text>📞 (269) 657-8243</Text>
      </Box>
    </Box>
  );
};

const faqData = [
  {
    id: 'split',
    title: 'Apply for a Land Split',
    content: [
      'A land split divides one parcel into two or more new parcels.',
      'Requirements:',
      '• Proof of ownership',
      '• Meets zoning and minimum lot size requirements',
      '• Approval from Equalization if names do not match exactly',
      '• Submission to the local municipality (township, city, village) for approval',
    ],
    law: 'https://www.legislature.mi.gov/documents/mcl/pdf/mcl-560-109.pdf',
  },
  {
    id: 'boundary',
    title: 'Adjust a Boundary Line',
    content: [
      'A boundary line adjustment shifts the property line between two existing parcels.',
      'Requirements:',
      '• Consent of both property owners',
      '• One owner must deed part of their land to the other',
      '• Deed must be recorded at the Register of Deeds',
      '• Application must reflect the recorded change',
      '• Approval from Equalization if names do not match exactly',
    ],
    law: 'https://www.legislature.mi.gov/documents/mcl/pdf/mcl-560-108.pdf',
  },
  {
    id: 'combine',
    title: 'Combine Parcels',
    content: [
      'A combination merges two or more parcels into a single property.',
      'Requirements:',
      '• Proof of ownership',
      '• Parcels must be adjacent',
      '• Must have identical ownership (names must match exactly)',
      '• Approval from Equalization before submission to the municipality',
    ],
    law: 'https://www.legislature.mi.gov/documents/mcl/pdf/mcl-560-105.pdf',
  },
];

export default Sidebar;
