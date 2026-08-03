import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const aadharQuery = searchParams.get('aadhar');

  if (!aadharQuery) {
    return NextResponse.json(
      { error: 'Aadhar number is required for searching.' },
      { status: 400 }
    );
  }

  try {
    // Fetch live from the public Google Sheet export with no caching
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1P4FiopCv_Z8DVKMvwwafCeuNejYR3__d4mS0bDHkh9E/export?format=csv';
    const response = await fetch(SHEET_URL, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Google Sheets');
    }
    
    const fileContent = await response.text();
    
    // Parse the CSV
    const { data, errors } = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // Trim headers as some have trailing spaces
    });

    if (errors.length > 0) {
      console.error('CSV Parsing Errors:', errors);
    }

    // Filter by Aadhar Card Number
    const cleanQuery = aadharQuery.replace(/\s+/g, '').toLowerCase();
    
    const results = (data as any[]).filter((row) => {
      const aadhar = row['Aadhar Card Number']?.toString().replace(/\s+/g, '').toLowerCase();
      return aadhar === cleanQuery;
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while searching.' },
      { status: 500 }
    );
  }
}

