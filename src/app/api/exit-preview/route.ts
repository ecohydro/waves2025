import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  // Exit the current user from draft mode
  (await draftMode()).disable();
  redirect('/');
}
