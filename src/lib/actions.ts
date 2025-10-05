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

export type SerializableAccount = Omit<Account, 'timestamp'> & {
    timestamp: string;
};


// This function runs on the server and won't be affected by the client-side
// error handling changes for now. We will adjust if needed.
export async function claimAccount(): Promise<{ data?: SerializableAccount; error?: string; }> {
  try {
    const accountsRef = collection(db, 'minecraft_accounts');
    // Removed the orderBy clause to avoid needing a composite index
    const q = query(
      accountsRef,
      where('status', '==', 'unclaimed'),
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

    const finalTimestamp = Timestamp.now();

    // Return a plain, serializable object
    const returnData: SerializableAccount = {
        id: accountData.id,
        email: accountData.email,
        password: accountData.password,
        status: 'claimed',
        timestamp: finalTimestamp.toDate().toISOString(),
    }

    return { data: returnData };
  } catch (error) {
    console.error('Error claiming account:', error);
    if (error instanceof Error) {
        return { error: `Failed to claim account: ${error.message}` };
    }
    return { error: 'An unknown error occurred while claiming the account.' };
  }
}
