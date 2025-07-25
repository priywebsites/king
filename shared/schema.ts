import { pgTable, text, serial, integer, boolean, timestamp, decimal, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  confirmationCode: text("confirmation_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  services: text("services").array().notNull(), // Multiple services as array
  serviceType: text("service_type").notNull(), // Main service type for display
  barber: text("barber").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  notes: text("notes"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  totalDuration: integer("total_duration").notNull(), // Total duration in minutes
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, rescheduled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const phoneVerifications = pgTable("phone_verifications", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  verificationCode: text("verification_code").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const barberAwayDays = pgTable("barber_away_days", {
  id: serial("id").primaryKey(),
  barberName: text("barber_name").notNull(),
  awayDate: date("away_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const barberSessions = pgTable("barber_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  barberName: text("barber_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  confirmationCode: true,
  createdAt: true,
});

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerifications).omit({
  id: true,
  isVerified: true,
  createdAt: true,
});

export const insertBarberAwayDaySchema = createInsertSchema(barberAwayDays).omit({
  id: true,
  createdAt: true,
});

export const insertBarberSessionSchema = createInsertSchema(barberSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type PhoneVerification = typeof phoneVerifications.$inferSelect;
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;
export type BarberAwayDay = typeof barberAwayDays.$inferSelect;
export type InsertBarberAwayDay = z.infer<typeof insertBarberAwayDaySchema>;
export type BarberSession = typeof barberSessions.$inferSelect;
export type InsertBarberSession = z.infer<typeof insertBarberSessionSchema>;
