import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the Sleeper API with a known public league
    const response = await fetch('https://api.sleeper.app/v1/league/1234567890');
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'API Test Failed', 
          message: 'Sleeper API is accessible but league not found (expected for test ID)',
          statusCode: response.status 
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ 
      status: 'API Test Successful', 
      message: 'Sleeper API is working correctly',
      data: data 
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'API Test Failed', 
        message: 'Error connecting to Sleeper API',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
