import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { calculatePrediction, updateTimeSlotData, getBestTimeToVisit } from "./prediction";
import { insertCheckinSchema, insertLocationSchema, insertLocationTypeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/location-types", async (req, res) => {
    try {
      const types = await storage.getLocationTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch location types" });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const { typeId } = req.query;
      let locationsList;
      if (typeId && typeof typeId === "string") {
        locationsList = await storage.getLocationsByType(typeId);
      } else {
        locationsList = await storage.getLocations();
      }
      res.json(locationsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  app.get("/api/locations/:id/queue-status", async (req, res) => {
    try {
      const locationId = req.params.id;
      const prediction = await calculatePrediction(locationId);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }

      res.json({
        location,
        ...prediction,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue status" });
    }
  });

  app.get("/api/locations/:id/best-time", async (req, res) => {
    try {
      const bestTimes = await getBestTimeToVisit(req.params.id);
      res.json(bestTimes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch best times" });
    }
  });

  app.get("/api/locations/:id/history", async (req, res) => {
    try {
      const locationId = req.params.id;
      const slots = await storage.getTimeSlots(locationId);
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/checkin", async (req, res) => {
    try {
      const parsed = insertCheckinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid checkin data", details: parsed.error.errors });
      }

      const { locationId, deviceId, peopleAhead, queueStage } = parsed.data;

      const canCheckin = await storage.canDeviceCheckin(deviceId, locationId);
      if (!canCheckin) {
        return res.status(429).json({ error: "Please wait 15 minutes between check-ins at the same location" });
      }

      const checkin = await storage.createCheckin({
        locationId,
        deviceId,
        peopleAhead,
        queueStage: queueStage || "waiting",
      });

      await updateTimeSlotData(locationId, peopleAhead);

      res.status(201).json(checkin);
    } catch (error) {
      res.status(500).json({ error: "Failed to create checkin" });
    }
  });

  app.get("/api/checkins/device/:deviceId", async (req, res) => {
    try {
      const checkins = await storage.getDeviceCheckins(req.params.deviceId);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch checkins" });
    }
  });

  app.post("/api/seed", async (req, res) => {
    try {
      const existingTypes = await storage.getLocationTypes();
      if (existingTypes.length > 0) {
        return res.json({ message: "Data already seeded" });
      }

      const bankType = await storage.createLocationType({ name: "Bank", icon: "credit-card" });
      const hospitalType = await storage.createLocationType({ name: "Hospital", icon: "activity" });
      const govType = await storage.createLocationType({ name: "Government Office", icon: "briefcase" });

      const sampleLocations = [
        { name: "First National Bank - Downtown", address: "123 Main Street, Downtown", typeId: bankType.id, averageServiceTime: 8 },
        { name: "City Hospital - Emergency", address: "456 Health Ave, Medical District", typeId: hospitalType.id, averageServiceTime: 15 },
        { name: "DMV - Central Office", address: "789 Government Blvd, Civic Center", typeId: govType.id, averageServiceTime: 12 },
        { name: "Chase Bank - Mall Branch", address: "321 Shopping Center Dr", typeId: bankType.id, averageServiceTime: 6 },
        { name: "Community Clinic", address: "555 Wellness Way", typeId: hospitalType.id, averageServiceTime: 10 },
        { name: "Social Security Office", address: "888 Federal Plaza", typeId: govType.id, averageServiceTime: 20 },
      ];

      for (const loc of sampleLocations) {
        await storage.createLocation(loc);
      }

      res.json({ message: "Seed data created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
