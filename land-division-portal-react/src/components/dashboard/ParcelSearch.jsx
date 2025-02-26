import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Link,
  Input,
  Button,
  Spinner,
  Checkbox,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useTheme } from 'next-themes';

// Helper function to tokenize the owner name input
function tokenizeInput(input) {
  if (!input) return [];
  // Normalize: lowercase and remove punctuation
  const normalized = input.toLowerCase().replace(/[^\w\s]/g, ' ');
  // Split into tokens by whitespace and filter out empty tokens
  const tokens = normalized.split(/\s+/).filter(token => token.length > 0);
  // Optionally filter out stop words
  const stopWords = ['llc', 'inc', 'ltd', 'corp', 'and', '&', 'the'];
  return tokens.filter(token => !stopWords.includes(token));
}

const ParcelSearch = ({ onParcelSelect, onStartApplication }) => {
  const { currentUser } = useAuth();
  const [ownerSearch, setOwnerSearch] = useState('');
  const [parcelSearch, setParcelSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [parcels, setParcels] = useState([]);
  const [linkedParcels, setLinkedParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedParcels, setSelectedParcels] = useState([]);

  // Theme integration
  const { theme } = useTheme();
  const containerBg = theme === 'dark' ? 'gray.800' : 'gray.100';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const cardBg = theme === 'dark' ? 'gray.700' : 'white';
  const linkedBg = theme === 'dark' ? 'green.700' : 'green.100';

  // Real-time listener for user's linked parcels
  useEffect(() => {
    if (!currentUser?.uid) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userParcels = userDoc.data().parcels || [];
        const parcelPromises = userParcels.map(async (parcelNum) => {
          const parcelQuery = query(
            collection(db, 'parcels'),
            where('pnum', '==', parcelNum),
            limit(1)
          );
          const parcelSnapshot = await getDocs(parcelQuery);
          return parcelSnapshot.docs[0]?.data();
        });
        const parcelDetails = await Promise.all(parcelPromises);
        setLinkedParcels(parcelDetails.filter(Boolean));
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Combined search handler
  const handleSearch = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      let results = null; // Start with null instead of an empty array

      // Owner search
      if (ownerSearch.trim()) {
        const tokens = tokenizeInput(ownerSearch);
        if (tokens.length > 0) {
          const ownerQuery = query(
            collection(db, 'parcels'),
            where('searchTokens', 'array-contains', tokens[0]),
            limit(50)
          );
          const snapshot = await getDocs(ownerQuery);
          let ownerResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Further filter to ensure all tokens are present
          ownerResults = ownerResults.filter(doc => {
            const tokensInDoc = (doc.searchTokens || []).map(t => t.toLowerCase());
            return tokens.every(token => tokensInDoc.includes(token));
          });
          
          results = results === null ? ownerResults : results.filter(result =>
            ownerResults.some(ownerResult => ownerResult.pnum === result.pnum)
          );
        }
      }

      // Parcel number search
      if (parcelSearch.trim()) {
        const parcelQuery = query(
          collection(db, 'parcels'),
          where('pnum', '==', parcelSearch.trim())
        );
        const snapshot = await getDocs(parcelQuery);
        const parcelResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        results = results === null ? parcelResults : results.filter(result =>
          parcelResults.some(parcelResult => parcelResult.pnum === result.pnum)
        );
      }

      // Address search
      if (addressSearch.trim()) {
        const addressInput = addressSearch.trim().toUpperCase();
        const addressQuery = query(
          collection(db, 'parcels'),
          where('propstreetcombined', '==', addressInput)
        );
        const snapshot = await getDocs(addressQuery);
        const addressResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        results = results === null ? addressResults : results.filter(result =>
          addressResults.some(addressResult => addressResult.pnum === result.pnum)
        );
      }

      if (results === null) {
        setMessage('Please enter at least one search criterion.');
        setParcels([]);
      } else {
        setParcels(results);
        if (results.length === 0) {
          setMessage('No parcels found matching all search criteria.');
        }
      }
    } catch (error) {
      console.error('Error searching parcels:', error);
      setMessage('Error searching parcels.');
    }
    setLoading(false);
  };

  const handleAddParcel = async (parcelNumber) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        parcels: arrayUnion(parcelNumber)
      });
      setMessage(`Parcel ${parcelNumber} added to your profile.`);
    } catch (error) {
      console.error('Error adding parcel:', error);
      setMessage('Error adding parcel.');
    }
  };

  const handleRemoveParcel = async (parcelNumber) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        parcels: arrayRemove(parcelNumber)
      });
      setMessage(`Parcel ${parcelNumber} removed from your profile.`);
    } catch (error) {
      console.error('Error removing parcel:', error);
      setMessage('Error removing parcel.');
    }
  };

  const handleParcelAction = (action) => () => {
    if (selectedParcels.length === 0) {
      setMessage('Please select at least one parcel.');
      return;
    }

    // Validate parcel count based on action type
    const isValidSelection = {
      combine: selectedParcels.length >= 2,
      split: selectedParcels.length === 1,
      boundaryAdjustment: selectedParcels.length === 2
    };

    if (!isValidSelection[action]) {
      const errorMessages = {
        combine: 'Please select at least 2 parcels to combine.',
        split: 'Please select exactly 1 parcel to split.',
        boundaryAdjustment: 'Please select exactly 2 parcels for a boundary adjustment.'
      };
      setMessage(errorMessages[action]);
      return;
    }

    // Convert action to readable format for the application type
    const actionTypes = {
      combine: 'Property Combination',
      split: 'Property Split',
      boundaryAdjustment: 'Boundary Line Adjustment'
    };

    onStartApplication(selectedParcels, actionTypes[action]);
  };

  // Helper to get a unique key for a parcel
  const getParcelKey = (parcel) =>
    parcel.id ? String(parcel.id) : String(parcel.pnum);

  const handleParcelSelect = (parcel, checkedState) => {
    setSelectedParcels((prev) =>
      checkedState.checked
        ? [...prev, parcel]
        : prev.filter((p) => getParcelKey(p) !== getParcelKey(parcel))
    );
  };

  const renderSearchResults = () => {
    return parcels.map(parcel => {
      const isLinked = linkedParcels.some(linkedParcel => linkedParcel.pnum === parcel.pnum);
      return (
        <Box
          key={parcel.id || `parcel-${parcel.pnum}`}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          mb={2}
          cursor="pointer"
          onClick={() => onParcelSelect(parcel.pnum)}
          bg={isLinked ? linkedBg : cardBg}
          color={textColor}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="sm">{parcel.pnum || 'Parcel'}</Heading>
              <Text>{parcel.ownername1}</Text>
              <Text>{parcel.propstreetcombined}, {parcel.propcity}, {parcel.propstate} {parcel.propzip}</Text>
              {isLinked && (
                <Text fontSize="sm" color="green.600">
                  Already linked to your profile
                </Text>
              )}
            </Box>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddParcel(parcel.pnum);
              }}
              isDisabled={isLinked}
              size="sm"
              colorPalette="teal"
              title={isLinked ? "Parcel already linked" : "Add parcel"}
            >
              +
            </Button>
          </Flex>
        </Box>
      );
    });
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Linked Parcels Section */}
      <Box borderWidth="1px" borderRadius="md" p={4} bg={containerBg} color={textColor}>
        <Heading size="lg" mb={4}>Linked Parcels</Heading>
        <VStack spacing={4} align="stretch">
          <Box>
            <Heading size="md" mb={2}>Apply to selected parcels:</Heading>
            <HStack spacing={4}>
              <Button 
                onClick={handleParcelAction('combine')} 
                disabled={selectedParcels.length < 2} 
                colorScheme="blue"
              >
                Combine
              </Button>
              <Button 
                onClick={handleParcelAction('split')} 
                disabled={selectedParcels.length !== 1} 
                colorScheme="teal"
              >
                Split
              </Button>
              <Button 
                onClick={handleParcelAction('boundaryAdjustment')} 
                disabled={selectedParcels.length !== 2} 
                colorScheme="purple"
              >
                Boundary Line Adjustment
              </Button>
            </HStack>
          </Box>
          <VStack spacing={2} align="stretch">
            {linkedParcels.map(parcel => (
              <Flex key={parcel.id || `linked-${parcel.pnum}`} p={3} borderWidth="1px" borderRadius="md" align="center" bg={cardBg}>
                <Checkbox.Root
                  checked={selectedParcels.some(p => getParcelKey(p) === getParcelKey(parcel))}
                  onCheckedChange={checkedState => {
                    handleParcelSelect(parcel, checkedState);
                  }}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>{parcel.pnum}</Checkbox.Label>
                </Checkbox.Root>
                <Box ml={4} onClick={() => onParcelSelect(parcel.pnum)} flex="1" cursor="pointer">
                  <Text>{parcel.ownername1}</Text>
                  <Text>{parcel.propstreetcombined}, {parcel.propcity}, {parcel.propstate} {parcel.propzip}</Text>
                </Box>
                <Button onClick={() => handleRemoveParcel(parcel.pnum)} size="sm" colorPalette="red">
                  ×
                </Button>
              </Flex>
            ))}
          </VStack>
        </VStack>
      </Box>

      {/* Parcel Search Section */}
      <Box borderWidth="1px" borderRadius="md" p={4} bg={containerBg} color={textColor}>
        <Heading size="lg" mb={4}>Search Parcels</Heading>
        <Text mb={4}>Enter parcel number, address, or search by owner name below:</Text>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={1}>Owner Name</Text>
            <Input
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              placeholder="Enter owner name"
            />
          </Box>
          <Box>
            <Text mb={1}>Parcel Number</Text>
            <Input
              value={parcelSearch}
              onChange={(e) => setParcelSearch(e.target.value)}
              placeholder="ex: 80-01-001-001-01"
            />
          </Box>
          <Box>
            <Text mb={1}>Address</Text>
            <Input
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              placeholder="Enter property address"
            />
          </Box>
          <Button onClick={handleSearch} leftIcon={<FiSearch />} colorPalette="blue" width="10vw">
            Search
          </Button>
        </VStack>
        {loading && (
          <Flex justify="center" mt={4}>
            <Spinner />
          </Flex>
        )}
        {message && (
          <Text mt={4} color="red.500">
            {message}
          </Text>
        )}
        <Box mt={4}>
          {renderSearchResults()}
        </Box>
      </Box>
    </VStack>
  );
};

export default ParcelSearch;
