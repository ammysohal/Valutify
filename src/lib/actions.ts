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
import { analyzeAccountDistribution } from '@/ai/flows/analyze-account-distribution';
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

    revalidatePath('/dashboard');
    return { data: accountData };
  } catch (error) {
    console.error('Error claiming account:', error);
    return { error: 'Failed to claim account. Please try again.' };
  }
}

export async function getAccounts(): Promise<{ data?: Account[]; error?: string }> {
  try {
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const accounts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[];
    return { data: accounts };
  } catch (error) {
    console.error('Error getting accounts:', error);
    return { error: 'Failed to fetch accounts.' };
  }
}

const uploadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function uploadAccount(formData: FormData) {
  const rawFormData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedFields = uploadSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return { error: 'Invalid email or password.' };
  }
  
  const { email, password } = validatedFields.data;

  try {
    await addDoc(collection(db, 'accounts'), {
      email,
      password,
      status: 'unclaimed',
      timestamp: serverTimestamp(),
    });

    revalidatePath('/dashboard');
    return { success: 'Account uploaded successfully.' };
  } catch (error) {
    console.error('Error uploading account:', error);
    return { error: 'Failed to upload account.' };
  }
}

export async function updateAccountStatus(id: string, status: 'claimed' | 'unclaimed') {
  try {
    await updateDoc(doc(db, 'accounts', id), { status });
    revalidatePath('/dashboard');
    return { success: `Account marked as ${status}.` };
  } catch (error) {
    return { error: 'Failed to update account status.' };
  }
}

export async function deleteAccount(id: string) {
  try {
    await deleteDoc(doc(db, 'accounts', id));
    revalidatePath('/dashboard');
    return { success: 'Account deleted successfully.' };
  } catch (error) {
    return { error: 'Failed to delete account.' };
  }
}


export async function runAccountAnalysis() {
    try {
        const { data: accounts, error } = await getAccounts();
        if (error || !accounts) {
            return { error: "Failed to fetch accounts for analysis." };
        }

        const accountDataForAI = accounts.map(acc => ({
            email: acc.email,
            password: acc.password || '******', // Hide password if not available
            status: acc.status,
        }));

        const result = await analyzeAccountDistribution({ accountData: accountDataForAI });
        return { data: result.analysisResults };
    } catch (e) {
        console.error("Analysis failed", e);
        return { error: "An error occurred while running the analysis." };
    }
}
