import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req) {
  try {
   
    const buffer = await req.arrayBuffer();

    // Parsing the PDF buffer to extract text
    const data = await pdf(Buffer.from(buffer));

    // Checking if text extraction was successful
    if (!data.text || data.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text extracted from the PDF' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: data.text });
  } catch (err) {
    console.error('PDF parsing error:', err);
    return NextResponse.json(
      { error: 'Failed to parse PDF. Make sure the file is a valid PDF.' },
      { status: 500 }
    );
  }
}
