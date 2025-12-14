import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_LOCATIONS_KEY = "@queuesense_saved_locations";
const RECENT_CHECKINS_KEY = "@queuesense_recent_checkins";

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  typeId: string;
  savedAt: string;
}

export interface RecentCheckin {
  id: string;
  locationId: string;
  locationName: string;
  peopleAhead: number;
  createdAt: string;
}

export async function getSavedLocations(): Promise<SavedLocation[]> {
  try {
    const data = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveLocation(location: SavedLocation): Promise<void> {
  try {
    const locations = await getSavedLocations();
    const exists = locations.find(l => l.id === location.id);
    if (!exists) {
      locations.unshift(location);
      await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations.slice(0, 20)));
    }
  } catch {
  }
}

export async function removeSavedLocation(locationId: string): Promise<void> {
  try {
    const locations = await getSavedLocations();
    const filtered = locations.filter(l => l.id !== locationId);
    await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(filtered));
  } catch {
  }
}

export async function isLocationSaved(locationId: string): Promise<boolean> {
  try {
    const locations = await getSavedLocations();
    return locations.some(l => l.id === locationId);
  } catch {
    return false;
  }
}

export async function getRecentCheckins(): Promise<RecentCheckin[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_CHECKINS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addRecentCheckin(checkin: RecentCheckin): Promise<void> {
  try {
    const checkins = await getRecentCheckins();
    checkins.unshift(checkin);
    await AsyncStorage.setItem(RECENT_CHECKINS_KEY, JSON.stringify(checkins.slice(0, 50)));
  } catch {
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([SAVED_LOCATIONS_KEY, RECENT_CHECKINS_KEY]);
  } catch {
  }
}
