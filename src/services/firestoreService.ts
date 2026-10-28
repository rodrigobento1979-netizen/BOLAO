import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { BolaoPool, LotteryType } from '../types/lottery';
import { PixConfig, DEFAULT_PIX_CONFIG } from './pixService';

const POOLS_COLLECTION = 'pools';
const SETTINGS_COLLECTION = 'settings';
const ADMIN_CONFIG_DOC = 'admin_config';

// Load pools from Firestore
export async function loadPoolsFromFirestore(): Promise<Record<LotteryType, BolaoPool[]> | null> {
  try {
    const colRef = collection(db, POOLS_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) return null;

    const poolsMap: Record<LotteryType, BolaoPool[]> = {
      megasena: [],
      lotofacil: [],
      quina: [],
    };

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as BolaoPool;
      if (poolsMap[data.lotteryType]) {
        poolsMap[data.lotteryType].push(data);
      }
    });

    return poolsMap;
  } catch (err) {
    console.warn('Could not load from Firestore, using local state:', err);
    return null;
  }
}

// Save or update pool in Firestore
export async function savePoolToFirestore(pool: BolaoPool): Promise<void> {
  try {
    const docRef = doc(db, POOLS_COLLECTION, pool.id);
    await setDoc(docRef, pool, { merge: true });
  } catch (err) {
    console.warn('Could not sync pool to Firestore:', err);
  }
}

// Load Pix Configuration from Firestore
export async function loadPixConfigFromFirestore(): Promise<PixConfig> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ADMIN_CONFIG_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PixConfig;
    }
  } catch (err) {
    console.warn('Could not load Pix config from Firestore, using default:', err);
  }
  return DEFAULT_PIX_CONFIG;
}

// Save Pix Configuration to Firestore
export async function savePixConfigToFirestore(config: PixConfig): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, ADMIN_CONFIG_DOC);
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    console.warn('Could not save Pix config to Firestore:', err);
  }
}
