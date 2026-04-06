/**
 * Native bridge — wraps Capacitor plugins with web fallbacks.
 * Import from here instead of directly from @capacitor/* so the app
 * works identically on web and in the native shell.
 */

export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor?.isNativePlatform?.();
}

// ── Camera ────────────────────────────────────────────────────────────────────

export async function takeCameraPhoto(): Promise<string | null> {
  if (!isNative()) return null; // fall back to file input on web

  try {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // lets user pick camera or library
    });
    return photo.dataUrl ?? null;
  } catch {
    return null; // user cancelled
  }
}

// ── Geolocation ───────────────────────────────────────────────────────────────

export async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
  if (isNative()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.requestPermissions();
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  }

  // Web fallback
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

// ── Haptics ───────────────────────────────────────────────────────────────────

export async function hapticSuccess() {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* ignore */ }
}

export async function hapticLight() {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* ignore */ }
}

export async function hapticNotification(type: 'Success' | 'Warning' | 'Error' = 'Success') {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType[type] });
  } catch { /* ignore */ }
}

// ── Push Notifications ────────────────────────────────────────────────────────

export async function registerPushNotifications(): Promise<string | null> {
  if (!isNative()) return null;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return null;

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener('registrationError', () => {
        resolve(null);
      });
      // Timeout after 10s
      setTimeout(() => resolve(null), 10000);
    });
  } catch {
    return null;
  }
}
