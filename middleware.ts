import { NextRequest, NextResponse } from 'next/server';


export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get('sb-xaedljwwkpdugagyzcvk-auth-token');

  try {
    if (cookie && cookie.value) {  
      const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
      //console.log(decoded);
    } else {
      console.log('Cookie not found');
    }
  } catch (error) {
    console.error('Error decoding cookie:', error);
  }

  return NextResponse.next();
}
