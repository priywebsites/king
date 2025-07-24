import { 
  users, 
  appointments, 
  phoneVerifications,
  type User, 
  type InsertUser,
  type Appointment,
  type InsertAppointment,
  type PhoneVerification,
  type InsertPhoneVerification
} from "@shared/schema";

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
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  cancelAppointment(id: number): Promise<boolean>;
  
  // Phone verification methods
  createPhoneVerification(verification: InsertPhoneVerification): Promise<PhoneVerification>;
  getPhoneVerification(phoneNumber: string, code: string): Promise<PhoneVerification | undefined>;
  verifyPhone(phoneNumber: string, code: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
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
      createdAt
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentByCode(code: string): Promise<Appointment | undefined> {
    return Array.from(this.appointments.values()).find(
      (appointment) => appointment.confirmationCode === code,
    );
  }

  async getAppointmentsByBarber(barber: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter((appointment) => appointment.barber === barber && appointment.status === "confirmed")
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

  async verifyPhone(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await this.getPhoneVerification(phoneNumber, code);
    if (!verification) return false;
    
    verification.isVerified = true;
    this.phoneVerifications.set(verification.id, verification);
    return true;
  }

  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

export const storage = new MemStorage();
