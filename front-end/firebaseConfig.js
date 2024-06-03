import {initializeApp} from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD_7jlY0sTIlXH_ZqGbTlVaSj0kuKPCw14',
  authDomain: 'testbde-7eb84.firebaseapp.com',
  projectId: 'testbde-7eb84',
  storageBucket: 'testbde-7eb84.appspot.com',
  messagingSenderId: '114321355129',
  appId: '1:114321355129:web:6816cb878e2196a7683fa8',
  measurementId: 'G-D4JP2QMY2P',
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const firestore = getFirestore(app);

export {auth, firestore};
