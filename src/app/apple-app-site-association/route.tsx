import { NextResponse } from 'next/server';

export async function GET() {
  const res = {
    "applinks": {
      "apps": [],
      "details": [
        {
          "appID": "7TCGFK85GY.com.Trimry",
          "paths": [ "/trivia/*", "/user/*" ]
        }
      ]
    }
  };

  return NextResponse.json(res);
}