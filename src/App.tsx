'use client';

import { useState } from 'react';
import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
} from 'libphonenumber-js';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const countries = [
  { code: 'EG', name: 'Egypt', format: '10xxxxxxxx' },
  {
    code: 'KW',
    name: 'Kuwait',
    format: 'xxxxxxxx',
    prefixes: ['5', '6', '9', '41'],
  },
  { code: 'SA', name: 'Saudi Arabia', format: '5xxxxxxxx' },
  { code: 'AE', name: 'United Arab Emirates', format: '5xxxxxxxx' },
];

export default function PhoneValidator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('EG');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [randomNumbers, setRandomNumbers] = useState<string[]>([]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    validatePhoneNumber(value, country);
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    validatePhoneNumber(phoneNumber, value);
    setRandomNumbers([]);
  };

  const validatePhoneNumber = (number: string, countryCode: string) => {
    if (number) {
      try {
        const isValid = isValidPhoneNumber(number, countryCode as CountryCode);
        setIsValid(isValid);
      } catch (error) {
        setIsValid(false);
      }
    } else {
      setIsValid(null);
    }
  };

  const generateRandomPhoneNumber = (countryCode: string): string => {
    const selectedCountry = countries.find((c) => c.code === countryCode);
    if (!selectedCountry) return '';

    const generateDigit = (char: string) =>
      char === 'x' ? Math.floor(Math.random() * 10).toString() : char;

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      let nationalNumber: string;

      if (countryCode === 'KW') {
        const prefix =
          selectedCountry.prefixes[
            Math.floor(Math.random() * selectedCountry.prefixes.length)
          ];
        nationalNumber =
          prefix +
          selectedCountry.format
            .slice(prefix.length)
            .split('')
            .map(generateDigit)
            .join('');
      } else {
        nationalNumber = selectedCountry.format
          .split('')
          .map(generateDigit)
          .join('');
      }

      try {
        const phoneNumber = parsePhoneNumber(
          nationalNumber,
          countryCode as CountryCode
        );
        if (
          phoneNumber &&
          isValidPhoneNumber(phoneNumber.number, countryCode as CountryCode)
        ) {
          return phoneNumber.formatInternational();
        }
      } catch (error) {
        console.error('Error generating valid phone number:', error);
      }

      attempts++;
    }

    console.error(
      `Failed to generate a valid phone number for ${countryCode} after ${maxAttempts} attempts`
    );
    return '';
  };

  const handleGenerateRandomNumbers = () => {
    const newRandomNumbers = Array(5)
      .fill(null)
      .map(() => {
        const number = generateRandomPhoneNumber(country);
        return number ? number : 'Failed to generate';
      });
    setRandomNumbers(newRandomNumbers);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Phone Number Validator</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select onValueChange={handleCountryChange} defaultValue={country}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={handlePhoneChange}
            />
          </div>
          {isValid !== null && (
            <div
              className={`text-sm font-medium ${
                isValid ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isValid ? 'Valid phone number' : 'Invalid phone number'}
            </div>
          )}
          <div className="space-y-2">
            <Button type="button" onClick={handleGenerateRandomNumbers}>
              Generate 5 Random Numbers
            </Button>
            {randomNumbers.length > 0 && (
              <div className="space-y-2">
                <Label>Random Phone Numbers:</Label>
                <ul className="list-disc pl-5">
                  {randomNumbers.map((number, index) => (
                    <li key={index}>{number}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
