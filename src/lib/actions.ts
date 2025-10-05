'use server';

import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export type Account = {
  id: string;
  email: string;
  password?: string;
  status: 'unclaimed' | 'claimed';
  timestamp: Timestamp;
};

// This function runs on the server and won't be affected by the client-side
// error handling changes for now. We will adjust if needed.
export async function claimAccount() {
  try {
    const accountsRef = collection(db, 'minecraft_accounts');
    const q = query(
      accountsRef,
      where('status', '==', 'unclaimed'),
      orderBy('timestamp', 'asc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { error: 'No unclaimed accounts available. Please try again later.' };
    }

    const accountDoc = querySnapshot.docs[0];
    const accountData = { id: accountDoc.id, ...accountDoc.data() } as Account;

    await updateDoc(doc(db, 'minecraft_accounts', accountDoc.id), {
      status: 'claimed',
      timestamp: serverTimestamp(),
    });

    // Return a plain object, not a class instance
    const returnData = {
        ...accountData,
        timestamp: accountData.timestamp.toDate().toISOString(),
    }

    return { data: returnData };
  } catch (error) {
    console.error('Error claiming account:', error);
    return { error: 'Failed to claim account. Please try again.' };
  }
}
