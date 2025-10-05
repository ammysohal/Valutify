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
  addDoc,
  serverTimestamp,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type Account = {
  id: string;
  email: string;
  password?: string;
  status: 'unclaimed' | 'claimed';
  timestamp: any;
};

export async function claimAccount() {
  try {
    const accountsRef = collection(db, 'accounts');
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

    await updateDoc(doc(db, 'accounts', accountDoc.id), {
      status: 'claimed',
    });

    return { data: accountData };
  } catch (error) {
    console.error('Error claiming account:', error);
    return { error: 'Failed to claim account. Please try again.' };
  }
}
