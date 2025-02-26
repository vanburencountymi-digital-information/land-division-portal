import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { MdDownload } from "react-icons/md";
import ParcelViewer from './ParcelViewer';
import { PDFDocument } from 'pdf-lib';
import PDFOptionsModal from '../modals/PDFOptionsModal';

const ParcelDetail = ({ parcelId, onBack }) => {
  const { currentUser } = useAuth();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLinked, setIsLinked] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Theme integration using next-themes and Chakra's useColorModeValue
  const { theme } = useTheme();
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.200';
  const headerColor = theme === 'dark' ? 'gray.600' : 'gray.300';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const borderColor = theme === 'dark' ? 'gray.600' : 'gray.200';

  useEffect(() => {
    const fetchParcelDetail = async () => {
      try {
        const parcelRef = doc(db, 'parcels', parcelId);
        const parcelSnap = await getDoc(parcelRef);

        if (parcelSnap.exists()) {
          const parcelData = {
            id: parcelSnap.id,
            ...parcelSnap.data(),
          };
          setParcel(parcelData);
          
          // Check if parcel is in user's parcels array
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          const userParcels = userSnap.data().parcels || [];
          setIsLinked(userParcels.includes(parcelId));
        } else {
          console.error('No such parcel!');
        }
      } catch (error) {
        console.error('Error fetching parcel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcelDetail();
  }, [parcelId, currentUser.uid]);

  const handleLinkParcel = async () => {
    setLinkLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        parcels: arrayUnion(parcelId)
      });
      setIsLinked(true);
    } catch (error) {
      console.error('Error linking parcel:', error);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkParcel = async () => {
    setLinkLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        parcels: arrayRemove(parcelId)
      });
      setIsLinked(false);
    } catch (error) {
      console.error('Error unlinking parcel:', error);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    setIsPdfModalOpen(true);
  };

  const handleDownloadConfirm = async (includeContours) => {
    setIsPdfModalOpen(false);
    
    // Create and save the main PDF
    const doc = new jsPDF();
    
    // Set up formatting
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;
    
    // Helper function to add text and advance y position
    const addText = (text, size = 12, isBold = false) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(text, margin, yPosition);
      yPosition += size / 2 + 4;
    };

    // Add title
    addText('Parcel Details Report', 20, true);
    yPosition += 10;

    // Property Information Section
    addText('Property Information', 16, true);
    addText(`Parcel Number: ${parcel.pnum}`);
    addText(`Property Address: ${parcel.propstreetcombined}`);
    addText(`Location: ${parcel.propcity}, ${parcel.propstate} ${parcel.propzip}`);
    addText(`Homestead: ${parcel.homestead}%`);
    addText(`School District: ${parcel.schooldist}`);
    addText(`Property Class: ${parcel.propclass}`);
    yPosition += 10;

    // Owner Information Section
    addText('Owner Information', 16, true);
    addText(`Owner Name: ${parcel.ownername1}`);
    addText(`Owner Address: ${parcel.ownerstreetaddr}`);
    addText(`Owner Location: ${parcel.ownercity}, ${parcel.ownerstate} ${parcel.ownerzip}`);
    yPosition += 10;

    // Tax Information Section
    addText('Tax Information', 16, true);
    
    // Handle long legal descriptions by wrapping text
    const legalDesc = doc.splitTextToSize(
      `Legal Description: ${parcel.legalDescription || 'Not available'}`,
      pageWidth - (margin * 2)
    );
    doc.text(legalDesc, margin, yPosition);

    // Add generation date at the bottom
    doc.setFontSize(10);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      margin,
      doc.internal.pageSize.getHeight() - 10
    );

    // Save the main PDF
    doc.save(`parcel-${parcel.pnum}-details.pdf`);

    // If contours requested, open in new tab
    if (includeContours) {
      const contourUrl = `https://gis.stjosephcountymi.org/VBC/Contours/Contours_${parcel.pnum}.pdf`;
      window.open(contourUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh" bg={bgColor} color={textColor} p={4}>
        <Spinner size="xl" />
        <Text ml={4}>Loading parcel details...</Text>
      </Flex>
    );
  }

  if (!parcel) {
    return (
      <Flex direction="column" justify="center" align="center" bg={bgColor} color={textColor} p={4}>
        <Heading size="md" mb={4}>Parcel not found</Heading>
        <Button onClick={onBack} colorScheme="blue">
          Back to Parcels
        </Button>
      </Flex>
    );
  }

  return (
    <Box bg={bgColor} color={textColor} p={6} borderRadius="md">
      {/* Header */}
      <Flex align="center" mb={6} mt={-6} ml={-6} mr={-6} bg={headerColor} p={4} borderRadius="md">
        <Button variant="ghost" onClick={onBack} mr={4}>
          ← Back to Parcels
        </Button>
        <Heading size="lg">Parcel Details</Heading>
        {/* Action Buttons */}
        <Flex justify="flex-end" flex="1" gridGap={4}>
          <Button
            onClick={handleLinkParcel}
            colorPalette="blue"
            disabled={isLinked}
            loading={linkLoading}
          >
            Link Parcel
          </Button>
          <Button
            onClick={handleUnlinkParcel}
            colorPalette="red"
            disabled={!isLinked}
            loading={linkLoading}
          >
            Unlink Parcel
          </Button>
          <Button
            onClick={handleDownloadClick}
            colorScheme="green"
            leftIcon={<MdDownload />}
          >
            Download PDF
          </Button>
        </Flex>
      </Flex>

      {/* Property Information */}
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4}>
          Property Information
        </Heading>
        <Flex wrap="wrap" gridGap={4}>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Parcel Number:</Text>
            <Text>{parcel.pnum}</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Property Address:</Text>
            <Text>{parcel.propstreetcombined}</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Property Location:</Text>
            <Text>{`${parcel.propcity}, ${parcel.propstate} ${parcel.propzip}`}</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Homestead:</Text>
            <Text>{parcel.homestead}%</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">School District:</Text>
            <Text>{parcel.schooldist}</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Property Class:</Text>
            <Text>{parcel.propclass}</Text>
          </Box>
        </Flex>
      </Box>

      {/* Owner Information */}
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4}>
          Owner Information
        </Heading>
        <Flex wrap="wrap" gridGap={4}>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Owner Name:</Text>
            <Text>{parcel.ownername1}</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Owner Address:</Text>
            <Text>{parcel.ownerstreetaddr}</Text>
          </Box>
          <Box flex="1" minW="250px">
            <Text fontWeight="bold">Owner Location:</Text>
            <Text>{`${parcel.ownercity}, ${parcel.ownerstate} ${parcel.ownerzip}`}</Text>
          </Box>
        </Flex>
      </Box>

      {/* Modified Tax & Viewer Section */}
      <Box mb={6}>
        <Flex direction={{ base: 'column', md: 'row' }} gridGap={6}>
          {/* Tax Information */}
          <Box flex="1">
            <Heading as="h3" size="md" mb={4}>
              Tax Information
            </Heading>
            <Box p={4} borderWidth="1px" borderColor={borderColor} borderRadius="md">
              <Text fontWeight="bold" mb={1}>
                Tax Description:
              </Text>
              <Text>{parcel.legalDescription}</Text>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Separate Parcel Viewer Section */}
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4}>
          Parcel Viewer
        </Heading>
        <ParcelViewer parcelNumber={parcel.pnum} />
      </Box>

      {/* New Contour Map Section */}
      <Box mb={6}>
        <Heading as="h3" size="md" mb={4}>
          Contour Map
        </Heading>
        <Box borderWidth="1px" borderColor={borderColor} borderRadius="md" p={4}>
          <Flex direction="column" align="center" gap={4}>
            <Text>View elevation contours for this parcel</Text>
            <Button
              as="a"
              href={`https://gis.stjosephcountymi.org/VBC/Contours/Contours_${parcel.pnum}.pdf`}
              target="_blank"
              colorScheme="blue"
              leftIcon={<MdDownload />}
            >
              Open Contour Map
            </Button>
          </Flex>
        </Box>
      </Box>

      <PDFOptionsModal 
        open={isPdfModalOpen}
        onOpenChange={(open) => setIsPdfModalOpen(open)}
        onConfirm={handleDownloadConfirm}
      />
    </Box>
  );
};

export default ParcelDetail;
