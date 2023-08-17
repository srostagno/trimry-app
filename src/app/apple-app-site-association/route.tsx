import { NextResponse } from 'next/server';

export async function GET() {
  const res = {
    "applinks": {
      "apps": [],
      "details": [
        {
          "appID": "K895NCT6XV.com.Trimry",
          "paths": [ "/trivia/*" ]
        }
      ]
    }
  };

  return NextResponse.json(res);
}