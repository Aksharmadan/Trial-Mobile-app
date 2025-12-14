import { storage } from "./storage";
import type { Checkin, TimeSlot, Location } from "@shared/schema";

interface PredictionResult {
  estimatedWaitTime: number;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  currentQueueSize: number;
}

export async function calculatePrediction(locationId: string): Promise<PredictionResult> {
  const location = await storage.getLocation(locationId);
  if (!location) {
    return { estimatedWaitTime: 0, confidence: 0, trend: "stable", currentQueueSize: 0 };
  }

  const recentCheckins = await storage.getRecentCheckins(locationId, 60);
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  const historicalSlot = await storage.getTimeSlot(locationId, dayOfWeek, hour);

  const liveData = calculateLiveMetrics(recentCheckins, location);
  const historicalData = calculateHistoricalMetrics(historicalSlot);
  const result = combineMetrics(liveData, historicalData, location);

  await storage.createPrediction({
    locationId,
    estimatedWaitTime: result.estimatedWaitTime,
    confidence: result.confidence,
    trend: result.trend,
    currentQueueSize: result.currentQueueSize,
  });

  return result;
}

function calculateLiveMetrics(checkins: Checkin[], location: Location) {
  if (checkins.length === 0) {
    return { queueSize: 0, weight: 0, trend: "stable" as const };
  }

  const now = Date.now();
  let weightedSum = 0;
  let weightSum = 0;

  checkins.forEach((checkin) => {
    const age = (now - new Date(checkin.createdAt).getTime()) / (60 * 1000);
    const weight = Math.exp(-age / 30) * (checkin.confidence || 1);
    weightedSum += checkin.peopleAhead * weight;
    weightSum += weight;
  });

  const queueSize = weightSum > 0 ? weightedSum / weightSum : 0;

  const trend = calculateTrend(checkins);

  return { queueSize, weight: Math.min(checkins.length / 5, 1), trend };
}

function calculateTrend(checkins: Checkin[]): "increasing" | "stable" | "decreasing" {
  if (checkins.length < 3) return "stable";

  const recent = checkins.slice(0, Math.ceil(checkins.length / 2));
  const older = checkins.slice(Math.ceil(checkins.length / 2));

  const recentAvg = recent.reduce((sum, c) => sum + c.peopleAhead, 0) / recent.length;
  const olderAvg = older.reduce((sum, c) => sum + c.peopleAhead, 0) / older.length;

  const diff = recentAvg - olderAvg;
  const threshold = 2;

  if (diff > threshold) return "increasing";
  if (diff < -threshold) return "decreasing";
  return "stable";
}

function calculateHistoricalMetrics(slot: TimeSlot | undefined) {
  if (!slot || !slot.sampleCount || slot.sampleCount < 3) {
    return { averageWait: 0, averageQueue: 0, weight: 0 };
  }

  const reliability = Math.min(slot.sampleCount / 20, 1);
  return {
    averageWait: slot.averageWaitTime || 0,
    averageQueue: slot.averagePeopleCount || 0,
    weight: reliability,
  };
}

function combineMetrics(
  live: { queueSize: number; weight: number; trend: "increasing" | "stable" | "decreasing" },
  historical: { averageWait: number; averageQueue: number; weight: number },
  location: Location
): PredictionResult {
  const serviceTime = location.averageServiceTime || 5;

  const totalWeight = live.weight + historical.weight;
  
  if (totalWeight === 0) {
    return {
      estimatedWaitTime: 0,
      confidence: 0.1,
      trend: "stable",
      currentQueueSize: 0,
    };
  }

  let estimatedWait: number;
  let queueSize: number;
  
  if (live.weight > 0.5) {
    queueSize = live.queueSize;
    estimatedWait = Math.round(queueSize * serviceTime);
  } else if (historical.weight > 0.5) {
    queueSize = historical.averageQueue;
    estimatedWait = Math.round(historical.averageWait);
  } else {
    const liveNorm = live.weight / totalWeight;
    const histNorm = historical.weight / totalWeight;
    
    queueSize = live.queueSize * liveNorm + historical.averageQueue * histNorm;
    estimatedWait = Math.round(
      (live.queueSize * serviceTime * liveNorm) + (historical.averageWait * histNorm)
    );
  }

  const confidence = Math.min(0.3 + totalWeight * 0.5, 0.95);

  return {
    estimatedWaitTime: Math.max(0, estimatedWait),
    confidence: Math.round(confidence * 100) / 100,
    trend: live.trend,
    currentQueueSize: Math.round(queueSize),
  };
}

export async function updateTimeSlotData(locationId: string, peopleAhead: number): Promise<void> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  
  const location = await storage.getLocation(locationId);
  if (!location) return;

  const serviceTime = location.averageServiceTime || 5;
  const waitTime = peopleAhead * serviceTime;

  const existing = await storage.getTimeSlot(locationId, dayOfWeek, hour);
  
  if (existing) {
    const newCount = (existing.sampleCount || 0) + 1;
    const oldWeight = (existing.sampleCount || 0) / newCount;
    const newWeight = 1 / newCount;
    
    await storage.upsertTimeSlot({
      locationId,
      dayOfWeek,
      hour,
      averageWaitTime: ((existing.averageWaitTime || 0) * oldWeight) + (waitTime * newWeight),
      averagePeopleCount: ((existing.averagePeopleCount || 0) * oldWeight) + (peopleAhead * newWeight),
      sampleCount: newCount,
    });
  } else {
    await storage.upsertTimeSlot({
      locationId,
      dayOfWeek,
      hour,
      averageWaitTime: waitTime,
      averagePeopleCount: peopleAhead,
      sampleCount: 1,
    });
  }
}

export async function getBestTimeToVisit(locationId: string): Promise<{ hour: number; dayOfWeek: number; estimatedWait: number }[]> {
  const slots = await storage.getTimeSlots(locationId);
  
  if (slots.length === 0) {
    return [];
  }

  const validSlots = slots
    .filter(s => (s.sampleCount || 0) >= 2)
    .sort((a, b) => (a.averageWaitTime || 0) - (b.averageWaitTime || 0))
    .slice(0, 5);

  return validSlots.map(s => ({
    hour: s.hour,
    dayOfWeek: s.dayOfWeek,
    estimatedWait: Math.round(s.averageWaitTime || 0),
  }));
}
