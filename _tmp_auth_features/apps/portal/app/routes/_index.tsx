import { redirect } from 'react-router';

export async function loader() {
  return redirect('/auth/login');
}

export default function Index() {
  return null;
}
