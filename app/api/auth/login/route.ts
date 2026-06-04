import { NextRequest } from 'next/server';
import { getDoc } from '@/lib/sheets';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['Users'];
    const rows = await sheet.getRows();

    const user = rows.find((r: any) => r.get('email') === email);
    if (!user) return Response.json({ success: false, message: 'User not found' });

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    if (user.get('passwordHash') === hash) {
      const token = Buffer.from(`\( {email}: \){Date.now()}`).toString('base64');
      return Response.json({
        success: true,
        token,
        role: user.get('role'),
        name: user.get('name'),
        familyId: user.get('familyId')
      });
    }
    return Response.json({ success: false, message: 'Invalid password' });
  } catch (e) {
    return Response.json({ success: false, message: 'Server error' });
  }
}
