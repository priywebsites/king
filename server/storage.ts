import { 
  users, 
  appointments, 
  phoneVerifications,
  barberAwayDays,
  barberSessions,
  type User, 
  type InsertUser,
  type Appointment,
  type InsertAppointment,
  type PhoneVerification,
  type InsertPhoneVerification,
  type BarberAwayDay,
  type InsertBarberAwayDay,
  type BarberSession,
  type InsertBarberSession
} from "@shared/schema";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentByCode(code: string): Promise<Appointment | undefined>;
  getAppointmentsByBarber(barber: string): Promise<Appointment[]>;
  getAppointmentsByBarberAndDate(barber: string, date: string): Promise<Appointment[]>;
  getAppointmentsByBarberForDate(barber: string, date: string): Promise<Appointment[]>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  cancelAppointment(id: number): Promise<boolean>;
  
  // Phone verification methods
  createPhoneVerification(verification: InsertPhoneVerification): Promise<PhoneVerification>;
  getPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification | undefined>;
  getLatestVerificationCode(phoneNumber: string): Promise<PhoneVerification | undefined>;
  verifyPhone(phoneNumber: string, code: string): Promise<boolean>;
  
  // Admin methods
  clearAllAppointments(): Promise<void>;
  
  // Barber authentication methods
  createBarberSession(barberName: string): Promise<BarberSession>;
  getBarberSession(sessionId: string): Promise<BarberSession | undefined>;
  deleteBarberSession(sessionId: string): Promise<void>;
  
  // Barber away days methods
  addBarberAwayDays(barberName: string, dates: string[]): Promise<BarberAwayDay[]>;
  getBarberAwayDays(barberName: string): Promise<BarberAwayDay[]>;
  removeBarberAwayDay(barberName: string, date: string): Promise<void>;
  isBarberAway(barberName: string, date: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const { db } = await import("./db");
    const confirmationCode = this.generateConfirmationCode();
    const createdAt = new Date();
    
    const appointment = {
      ...insertAppointment,
      confirmationCode,
      createdAt,
      notes: insertAppointment.notes || null,
      status: insertAppointment.status || "confirmed"
    };
    
    const [created] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return created;
  }

  async getAppointmentByCode(code: string): Promise<Appointment | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.confirmationCode, code));
    return appointment || undefined;
  }

  async getAppointmentsByBarber(barber: string): Promise<Appointment[]> {
    const { db } = await import("./db");
    const { eq, and, gte } = await import("drizzle-orm");
    
    // Only return appointments from today onwards - no automatic deletion
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.barber, barber),
          eq(appointments.status, 'confirmed'),
          gte(appointments.appointmentDate, today)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async getAppointmentsByBarberAndDate(barber: string, date: string): Promise<Appointment[]> {
    const { db } = await import("./db");
    const { eq, and, gte, lt } = await import("drizzle-orm");
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.barber, barber),
          eq(appointments.status, 'confirmed'),
          gte(appointments.appointmentDate, startOfDay),
          lt(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  // New method for getting appointments by barber and specific date for dashboard
  async getAppointmentsByBarberForDate(barber: string, date: string): Promise<Appointment[]> {
    const { db } = await import("./db");
    const { eq, and, gte, lt } = await import("drizzle-orm");
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.barber, barber),
          eq(appointments.status, 'confirmed'),
          gte(appointments.appointmentDate, startOfDay),
          lt(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updated || undefined;
  }

  async cancelAppointment(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [cancelled] = await db
      .update(appointments)
      .set({ status: 'cancelled' })
      .where(eq(appointments.id, id))
      .returning();
    return !!cancelled;
  }

  async createPhoneVerification(verification: InsertPhoneVerification): Promise<PhoneVerification> {
    const { db } = await import("./db");
    const [created] = await db
      .insert(phoneVerifications)
      .values(verification)
      .returning();
    return created;
  }

  async getPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification | undefined> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.verificationCode, code)
        )
      );
    return verification || undefined;
  }

  async getLatestVerificationCode(phoneNumber: string): Promise<PhoneVerification | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [latest] = await db
      .select()
      .from(phoneVerifications)
      .where(eq(phoneVerifications.phoneNumber, phoneNumber))
      .orderBy(phoneVerifications.createdAt)
      .limit(1);
    return latest || undefined;
  }

  async verifyPhone(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await this.getPhoneVerification(phoneNumber, code);
    if (!verification) return false;
    
    // Check if code is still valid (5 minutes)
    const now = new Date();
    const createdAt = new Date(verification.createdAt);
    const timeDiff = now.getTime() - createdAt.getTime();
    return timeDiff <= 5 * 60 * 1000; // 5 minutes
  }

  async clearAllAppointments(): Promise<void> {
    const { db } = await import("./db");
    await db.delete(appointments);
  }

  // Barber authentication methods
  async createBarberSession(barberName: string): Promise<BarberSession> {
    const { db } = await import("./db");
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [session] = await db
      .insert(barberSessions)
      .values({
        sessionId,
        barberName,
        expiresAt
      })
      .returning();
    return session;
  }

  async getBarberSession(sessionId: string): Promise<BarberSession | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const now = new Date();
    
    const [session] = await db
      .select()
      .from(barberSessions)
      .where(eq(barberSessions.sessionId, sessionId));
    
    // Check if session exists and hasn't expired
    if (session && session.expiresAt > now) {
      return session;
    }
    
    // Clean up expired session
    if (session) {
      await this.deleteBarberSession(sessionId);
    }
    
    return undefined;
  }

  async deleteBarberSession(sessionId: string): Promise<void> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    await db
      .delete(barberSessions)
      .where(eq(barberSessions.sessionId, sessionId));
  }

  // Barber away days methods
  async addBarberAwayDays(barberName: string, dates: string[]): Promise<BarberAwayDay[]> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    
    const awayDays: BarberAwayDay[] = [];
    
    for (const date of dates) {
      // Check if already exists
      const [existing] = await db
        .select()
        .from(barberAwayDays)
        .where(
          and(
            eq(barberAwayDays.barberName, barberName),
            eq(barberAwayDays.awayDate, date)
          )
        );
      
      if (!existing) {
        const [awayDay] = await db
          .insert(barberAwayDays)
          .values({
            barberName,
            awayDate: date
          })
          .returning();
        awayDays.push(awayDay);
      } else {
        awayDays.push(existing);
      }
    }
    
    return awayDays;
  }

  async getBarberAwayDays(barberName: string): Promise<BarberAwayDay[]> {
    const { db } = await import("./db");
    const { eq, gte, and } = await import("drizzle-orm");
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(barberAwayDays)
      .where(
        and(
          eq(barberAwayDays.barberName, barberName),
          gte(barberAwayDays.awayDate, today)
        )
      )
      .orderBy(barberAwayDays.awayDate);
  }

  async removeBarberAwayDay(barberName: string, date: string): Promise<void> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    
    await db
      .delete(barberAwayDays)
      .where(
        and(
          eq(barberAwayDays.barberName, barberName),
          eq(barberAwayDays.awayDate, date)
        )
      );
  }

  async isBarberAway(barberName: string, date: string): Promise<boolean> {
    const { db } = await import("./db");
    const { eq, and } = await import("drizzle-orm");
    
    const [awayDay] = await db
      .select()
      .from(barberAwayDays)
      .where(
        and(
          eq(barberAwayDays.barberName, barberName),
          eq(barberAwayDays.awayDate, date)
        )
      );
    
    return !!awayDay;
  }

  async getAllBarbersAwayDays(): Promise<BarberAwayDay[]> {
    const { db } = await import("./db");
    const { gte } = await import("drizzle-orm");
    const today = new Date().toISOString().split('T')[0];
    
    return await db
      .select()
      .from(barberAwayDays)
      .where(gte(barberAwayDays.awayDate, today))
      .orderBy(barberAwayDays.awayDate);
  }

  async storePhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification> {
    const { db } = await import("./db");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    const [verification] = await db
      .insert(phoneVerifications)
      .values({
        phoneNumber,
        verificationCode: code,
        expiresAt,
        isVerified: false
      })
      .returning();
    return verification;
  }

  async verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean> {
    const { db } = await import("./db");
    const { eq, and, gt } = await import("drizzle-orm");
    const now = new Date();
    
    const [verification] = await db
      .select()
      .from(phoneVerifications)
      .where(
        and(
          eq(phoneVerifications.phoneNumber, phoneNumber),
          eq(phoneVerifications.verificationCode, code),
          gt(phoneVerifications.expiresAt, now)
        )
      );
    
    return !!verification;
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

// Using DatabaseStorage - MemStorage removed for production
export class MemStorage_DEPRECATED implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private phoneVerifications: Map<number, PhoneVerification>;
  private currentUserId: number;
  private currentAppointmentId: number;
  private currentVerificationId: number;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.phoneVerifications = new Map();
    this.currentUserId = 1;
    this.currentAppointmentId = 1;
    this.currentVerificationId = 1;
    
    // Reset appointments daily at 9 PM PST (when barbershop closes)
    this.scheduleAppointmentReset();
  }

  private scheduleAppointmentReset() {
    const now = new Date();
    const closingTime = new Date();
    closingTime.setHours(21, 0, 0, 0); // 9 PM PST
    
    // If we've already passed 9 PM today, schedule for tomorrow
    if (now > closingTime) {
      closingTime.setDate(closingTime.getDate() + 1);
    }
    
    const timeUntilReset = closingTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetAppointments();
      // Schedule the next reset for tomorrow
      setInterval(() => this.resetAppointments(), 24 * 60 * 60 * 1000); // 24 hours
    }, timeUntilReset);
  }

  private resetAppointments() {
    console.log("Resetting appointments - barbershop closed for the day");
    this.appointments.clear();
    this.currentAppointmentId = 1;
  }

  // Method to manually reset appointments
  async clearAllAppointments(): Promise<void> {
    this.appointments.clear();
    this.currentAppointmentId = 1;
    console.log("All appointments manually cleared");
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Appointment methods
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const confirmationCode = this.generateConfirmationCode();
    const createdAt = new Date();
    
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      confirmationCode,
      createdAt,
      notes: insertAppointment.notes || null,
      status: insertAppointment.status || "confirmed"
    };
    
    this.appointments.set(id, appointment);
    console.log(`Appointment created for barber ${appointment.barber}:`, appointment.id);
    return appointment;
  }

  async getAppointmentByCode(code: string): Promise<Appointment | undefined> {
    return Array.from(this.appointments.values()).find(
      (appointment) => appointment.confirmationCode === code,
    );
  }

  async getAppointmentsByBarber(barber: string): Promise<Appointment[]> {
    const appointments = Array.from(this.appointments.values())
      .filter((appointment) => appointment.barber === barber && appointment.status === "confirmed")
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    console.log(`Found ${appointments.length} appointments for barber ${barber} out of ${this.appointments.size} total`);
    return appointments;
  }

  async getAppointmentsByBarberForDate(barber: string, date: string): Promise<Appointment[]> {
    // Alias method for the MemStorage implementation
    return this.getAppointmentsByBarberAndDate(barber, date);
  }

  async getAppointmentsByBarberAndDate(barber: string, date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.appointments.values())
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return appointment.barber === barber && 
               appointment.status === "confirmed" &&
               appointmentDate >= startOfDay && 
               appointmentDate <= endOfDay;
      })
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async cancelAppointment(id: number): Promise<boolean> {
    const appointment = this.appointments.get(id);
    if (!appointment) return false;
    
    appointment.status = "cancelled";
    this.appointments.set(id, appointment);
    return true;
  }

  // Phone verification methods
  async createPhoneVerification(insertVerification: InsertPhoneVerification): Promise<PhoneVerification> {
    const id = this.currentVerificationId++;
    const createdAt = new Date();
    const isVerified = false;
    
    const verification: PhoneVerification = { 
      ...insertVerification, 
      id, 
      isVerified,
      createdAt
    };
    
    this.phoneVerifications.set(id, verification);
    return verification;
  }

  async getPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification | undefined> {
    return Array.from(this.phoneVerifications.values()).find(
      (verification) => 
        verification.phoneNumber === phoneNumber && 
        verification.verificationCode === code &&
        new Date() < new Date(verification.expiresAt)
    );
  }

  async getLatestVerificationCode(phoneNumber: string): Promise<PhoneVerification | undefined> {
    return Array.from(this.phoneVerifications.values())
      .filter(verification => verification.phoneNumber === phoneNumber)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  async verifyPhone(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await this.getPhoneVerification(phoneNumber, code);
    if (!verification) return false;
    
    verification.isVerified = true;
    this.phoneVerifications.set(verification.id, verification);
    return true;
  }

  async clearAllAppointments(): Promise<void> {
    this.appointments.clear();
  }

  // Barber authentication methods - deprecated implementation
  async createBarberSession(barberName: string): Promise<BarberSession> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }
  async getBarberSession(sessionId: string): Promise<BarberSession | undefined> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }
  async deleteBarberSession(sessionId: string): Promise<void> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }
  async addBarberAwayDays(barberName: string, dates: string[]): Promise<BarberAwayDay[]> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }
  async getBarberAwayDays(barberName: string): Promise<BarberAwayDay[]> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }
  async removeBarberAwayDay(barberName: string, date: string): Promise<void> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }
  async isBarberAway(barberName: string, date: string): Promise<boolean> {
    throw new Error("MemStorage deprecated - use DatabaseStorage");
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

export const storage = new DatabaseStorage();
