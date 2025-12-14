import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const locationTypes = pgTable("location_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  typeId: varchar("type_id").notNull().references(() => locationTypes.id),
  latitude: real("latitude"),
  longitude: real("longitude"),
  averageServiceTime: integer("average_service_time").default(5),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("locations_type_idx").on(table.typeId),
  index("locations_active_idx").on(table.isActive),
]);

export const checkins = pgTable("checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  deviceId: text("device_id").notNull(),
  peopleAhead: integer("people_ahead").notNull(),
  queueStage: text("queue_stage").default("waiting"),
  confidence: real("confidence").default(1.0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("checkins_location_idx").on(table.locationId),
  index("checkins_device_idx").on(table.deviceId),
  index("checkins_created_idx").on(table.createdAt),
]);

export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  dayOfWeek: integer("day_of_week").notNull(),
  hour: integer("hour").notNull(),
  averageWaitTime: real("average_wait_time").default(0),
  averagePeopleCount: real("average_people_count").default(0),
  sampleCount: integer("sample_count").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("time_slots_location_idx").on(table.locationId),
  index("time_slots_day_hour_idx").on(table.dayOfWeek, table.hour),
]);

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  locationId: varchar("location_id").notNull().references(() => locations.id),
  estimatedWaitTime: integer("estimated_wait_time").notNull(),
  confidence: real("confidence").default(0.5),
  trend: text("trend").default("stable"),
  currentQueueSize: integer("current_queue_size").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("predictions_location_idx").on(table.locationId),
  index("predictions_created_idx").on(table.createdAt),
]);

export const locationTypesRelations = relations(locationTypes, ({ many }) => ({
  locations: many(locations),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  type: one(locationTypes, {
    fields: [locations.typeId],
    references: [locationTypes.id],
  }),
  checkins: many(checkins),
  timeSlots: many(timeSlots),
  predictions: many(predictions),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
  location: one(locations, {
    fields: [checkins.locationId],
    references: [locations.id],
  }),
}));

export const timeSlotsRelations = relations(timeSlots, ({ one }) => ({
  location: one(locations, {
    fields: [timeSlots.locationId],
    references: [locations.id],
  }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  location: one(locations, {
    fields: [predictions.locationId],
    references: [locations.id],
  }),
}));

export const insertLocationTypeSchema = createInsertSchema(locationTypes).pick({
  name: true,
  icon: true,
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
  address: true,
  typeId: true,
  latitude: true,
  longitude: true,
  averageServiceTime: true,
});

export const insertCheckinSchema = createInsertSchema(checkins).pick({
  locationId: true,
  deviceId: true,
  peopleAhead: true,
  queueStage: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).pick({
  locationId: true,
  dayOfWeek: true,
  hour: true,
  averageWaitTime: true,
  averagePeopleCount: true,
  sampleCount: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).pick({
  locationId: true,
  estimatedWaitTime: true,
  confidence: true,
  trend: true,
  currentQueueSize: true,
});

export type LocationType = typeof locationTypes.$inferSelect;
export type InsertLocationType = z.infer<typeof insertLocationTypeSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Checkin = typeof checkins.$inferSelect;
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
