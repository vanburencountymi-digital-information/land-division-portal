import React, { useState } from 'react';
import {
  VStack,
  Input,
  SimpleGrid,
  Box,
  Fieldset,
  NativeSelect,
  Button,
} from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { Field } from './ui/field';

const ProfileForm = ({ 
  initialData, 
  onSubmit, 
  submitButtonText = "Save Profile",
  showBackToDashboard = true 
}) => {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Define colors based on current theme
  const bgColor = theme === 'dark' ? 'gray.800' : 'gray.100';
  const textColor = theme === 'dark' ? 'whiteAlpha.900' : 'gray.800';
  const inputBg = theme === 'dark' ? 'gray.700' : 'white';
  const readOnlyBg = theme === 'dark' ? 'gray.600' : 'gray.100';

  // List of US states for the dropdown
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateZip = (zip) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add this new function to format phone numbers
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format the number as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return `(${digits}`;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    // Limit to 10 digits
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Add phone input handler
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    e.target.value = formattedPhone;
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = {
      firstName: event.target.firstName.value.trim(),
      lastName: event.target.lastName.value.trim(),
      email: event.target.email.value.trim(),
      phone: event.target.phone.value.trim(),
      addressLine1: event.target.addressLine1.value.trim(),
      addressLine2: event.target.addressLine2.value.trim(),
      city: event.target.city.value.trim(),
      state: event.target.state.value,
      zipCode: event.target.zipCode.value.trim(),
    };

    // Validation
    const newErrors = {};

    // Required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'addressLine1', 'city', 'state', 'zipCode'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Format validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter phone in format: (XXX) XXX-XXXX';
    }

    if (formData.zipCode && !validateZip(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    // If there are validation errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Sanitize data before submission
      const sanitizedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value
        ])
      );

      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box w="100%" maxW="800px" mx="auto" p={4} bg={bgColor} color={textColor}>
      <form onSubmit={handleSubmit}>
        <Fieldset.Root>
          <Fieldset.Legend>Personal Information</Fieldset.Legend>
          <SimpleGrid columns={{ base: 1, md: 2 }} rowGap={6} columnGap={6}>
            <Field 
              label="First Name"
              required
              errorText={errors.firstName}
            >
              <Input
                id="firstName"
                name="firstName"
                placeholder="First Name"
                defaultValue={initialData?.firstName}
                required
                bg={inputBg}
                onChange={() => {
                  if (errors.firstName) {
                    setErrors(prev => ({ ...prev, firstName: undefined }));
                  }
                }}
              />
            </Field>

            <Field 
              label="Last Name"
              required
              errorText={errors.lastName}
            >
              <Input
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                defaultValue={initialData?.lastName}
                required
                bg={inputBg}
                onChange={() => {
                  if (errors.lastName) {
                    setErrors(prev => ({ ...prev, lastName: undefined }));
                  }
                }}
              />
            </Field>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} rowGap={6} columnGap={6} mt={6}>
            <Field 
              label="Email"
              required
              errorText={errors.email}
            >
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={initialData?.email}
                readOnly={!!initialData?.email}
                bg={initialData?.email ? readOnlyBg : inputBg}
                required
              />
            </Field>

            <Field 
              label="Phone Number"
              required
              errorText={errors.phone}
              helperText="Format: (XXX) XXX-XXXX"
            >
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(XXX) XXX-XXXX"
                defaultValue={initialData?.phone}
                required
                bg={inputBg}
                onChange={handlePhoneChange}
                maxLength={14}
                borderColor={errors.phone ? 'red.500' : undefined}
                _focus={{
                  borderColor: errors.phone ? 'red.500' : 'blue.500',
                  boxShadow: errors.phone ? '0 0 0 1px #E53E3E' : '0 0 0 1px #3182ce'
                }}
              />
            </Field>
          </SimpleGrid>
        </Fieldset.Root>

        <Fieldset.Root mt={8}>
          <Fieldset.Legend>Address Information</Fieldset.Legend>
          <VStack spacing={6} align="stretch">
            <Field 
              label="Address Line 1"
              required
              errorText={errors.addressLine1}
            >
              <Input
                id="addressLine1"
                name="addressLine1"
                placeholder="Street Address"
                defaultValue={initialData?.addressLine1}
                required
                bg={inputBg}
                onChange={() => {
                  if (errors.addressLine1) {
                    setErrors(prev => ({ ...prev, addressLine1: undefined }));
                  }
                }}
              />
            </Field>

            <Field 
              label="Address Line 2"
              optionalText="(Optional)"
            >
              <Input
                id="addressLine2"
                name="addressLine2"
                placeholder="Apartment, suite, etc."
                defaultValue={initialData?.addressLine2}
                bg={inputBg}
              />
            </Field>

            <SimpleGrid columns={{ base: 1, md: 3 }} rowGap={6} columnGap={6}>
              <Field 
                label="City"
                required
                errorText={errors.city}
              >
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  defaultValue={initialData?.city}
                  required
                  bg={inputBg}
                  onChange={() => {
                    if (errors.city) {
                      setErrors(prev => ({ ...prev, city: undefined }));
                    }
                  }}
                />
              </Field>

              <Field 
                label="State"
                required
                errorText={errors.state}
              >
                <NativeSelect.Root>
                  <NativeSelect.Field
                    id="state"
                    name="state"
                    placeholder="Select state"
                    defaultValue={initialData?.state}
                    required
                    bg={inputBg}
                    onChange={() => {
                      if (errors.state) {
                        setErrors(prev => ({ ...prev, state: undefined }));
                      }
                    }}
                  >
                    <option value="">Select state</option>
                    {states.map(state => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field>

              <Field 
                label="ZIP Code"
                required
                errorText={errors.zipCode}
              >
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="ZIP Code"
                  defaultValue={initialData?.zipCode}
                  required
                  bg={inputBg}
                  onChange={() => {
                    if (errors.zipCode) {
                      setErrors(prev => ({ ...prev, zipCode: undefined }));
                    }
                  }}
                />
              </Field>
            </SimpleGrid>
          </VStack>
        </Fieldset.Root>

        {errors.submit && (
          <Field errorText={errors.submit} />
        )}

        <Button
          mt={6}
          colorPalette="blue"
          type="submit"
          disabled={isSubmitting}
          width="full"
        >
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </form>
    </Box>
  );
};

export default ProfileForm;
