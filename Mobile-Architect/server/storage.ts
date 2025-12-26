import { 
  locationTypes, locations, checkins, timeSlots, predictions,
  type LocationType, type InsertLocationType,
  type Location, type InsertLocation,
  type Checkin, type InsertCheckin,
  type TimeSlot, type InsertTimeSlot,
  type Prediction, type InsertPrediction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

function requireDb() {
  if (!db) {
    throw new Error("Database not configured. Please set DATABASE_URL environment variable.");
  }
  return db;
}

export interface IStorage {
  getLocationTypes(): Promise<LocationType[]>;
  getLocationType(id: string): Promise<LocationType | undefined>;
  createLocationType(data: InsertLocationType): Promise<LocationType>;
  
  getLocations(): Promise<Location[]>;
  getLocationsByType(typeId: string): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(data: InsertLocation): Promise<Location>;
  
  getCheckins(locationId: string, since?: Date): Promise<Checkin[]>;
  getRecentCheckins(locationId: string, minutes: number): Promise<Checkin[]>;
  createCheckin(data: InsertCheckin): Promise<Checkin>;
  getDeviceCheckins(deviceId: string): Promise<Checkin[]>;
  canDeviceCheckin(deviceId: string, locationId: string): Promise<boolean>;
  
  getTimeSlots(locationId: string): Promise<TimeSlot[]>;
  getTimeSlot(locationId: string, dayOfWeek: number, hour: number): Promise<TimeSlot | undefined>;
  upsertTimeSlot(data: InsertTimeSlot): Promise<TimeSlot>;
  
  getPrediction(locationId: string): Promise<Prediction | undefined>;
  createPrediction(data: InsertPrediction): Promise<Prediction>;
}

export class DatabaseStorage implements IStorage {
  async getLocationTypes(): Promise<LocationType[]> {
    return requireDb().select().from(locationTypes);
  }

  async getLocationType(id: string): Promise<LocationType | undefined> {
    const [type] = await requireDb().select().from(locationTypes).where(eq(locationTypes.id, id));
    return type || undefined;
  }

  async createLocationType(data: InsertLocationType): Promise<LocationType> {
    const [type] = await requireDb().insert(locationTypes).values(data).returning();
    return type;
  }

  async getLocations(): Promise<Location[]> {
    return requireDb().select().from(locations).where(eq(locations.isActive, true));
  }

  async getLocationsByType(typeId: string): Promise<Location[]> {
    return requireDb().select().from(locations).where(
      and(eq(locations.typeId, typeId), eq(locations.isActive, true))
    );
  }

  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await requireDb().select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async createLocation(data: InsertLocation): Promise<Location> {
    const [location] = await requireDb().insert(locations).values(data).returning();
    return location;
  }

  async getCheckins(locationId: string, since?: Date): Promise<Checkin[]> {
    if (since) {
      return requireDb().select().from(checkins).where(
        and(eq(checkins.locationId, locationId), gte(checkins.createdAt, since))
      ).orderBy(desc(checkins.createdAt));
    }
    return requireDb().select().from(checkins).where(eq(checkins.locationId, locationId)).orderBy(desc(checkins.createdAt));
  }

  async getRecentCheckins(locationId: string, minutes: number): Promise<Checkin[]> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return this.getCheckins(locationId, since);
  }

  async createCheckin(data: InsertCheckin): Promise<Checkin> {
    const [checkin] = await requireDb().insert(checkins).values({
      ...data,
      confidence: 1.0,
    }).returning();
    return checkin;
  }

  async getDeviceCheckins(deviceId: string): Promise<Checkin[]> {
    return requireDb().select().from(checkins).where(eq(checkins.deviceId, deviceId)).orderBy(desc(checkins.createdAt)).limit(50);
  }

  async canDeviceCheckin(deviceId: string, locationId: string): Promise<boolean> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentCheckins = await requireDb().select().from(checkins).where(
      and(
        eq(checkins.deviceId, deviceId),
        eq(checkins.locationId, locationId),
        gte(checkins.createdAt, fifteenMinutesAgo)
      )
    );
    return recentCheckins.length === 0;
  }

  async getTimeSlots(locationId: string): Promise<TimeSlot[]> {
    return requireDb().select().from(timeSlots).where(eq(timeSlots.locationId, locationId));
  }

  async getTimeSlot(locationId: string, dayOfWeek: number, hour: number): Promise<TimeSlot | undefined> {
    const [slot] = await requireDb().select().from(timeSlots).where(
      and(
        eq(timeSlots.locationId, locationId),
        eq(timeSlots.dayOfWeek, dayOfWeek),
        eq(timeSlots.hour, hour)
      )
    );
    return slot || undefined;
  }

  async upsertTimeSlot(data: InsertTimeSlot): Promise<TimeSlot> {
    const existing = await this.getTimeSlot(data.locationId, data.dayOfWeek, data.hour);
    if (existing) {
      const [updated] = await requireDb().update(timeSlots)
        .set({
          averageWaitTime: data.averageWaitTime,
          averagePeopleCount: data.averagePeopleCount,
          sampleCount: data.sampleCount,
          updatedAt: new Date(),
        })
        .where(eq(timeSlots.id, existing.id))
        .returning();
      return updated;
    }
    const [slot] = await requireDb().insert(timeSlots).values(data).returning();
    return slot;
  }

  async getPrediction(locationId: string): Promise<Prediction | undefined> {
    const [prediction] = await requireDb().select().from(predictions)
      .where(eq(predictions.locationId, locationId))
      .orderBy(desc(predictions.createdAt))
      .limit(1);
    return prediction || undefined;
  }

  async createPrediction(data: InsertPrediction): Promise<Prediction> {
    const [prediction] = await requireDb().insert(predictions).values(data).returning();
    return prediction;
  }
}

export const storage = new DatabaseStorage();
