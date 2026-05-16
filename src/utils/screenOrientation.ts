import * as ScreenOrientation from 'expo-screen-orientation';

/** Restaura retrato nas telas principais do app. */
export async function lockPortrait() {
  try {
    await ScreenOrientation.unlockAsync();
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  } catch {
    // Expo Go / web podem não suportar
  }
}

/** Permite girar o celular só na tela do player. */
export async function unlockOrientation() {
  try {
    await ScreenOrientation.unlockAsync();
  } catch {
    // ignore
  }
}
