import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertPhoneVerificationSchema } from "@shared/schema";
import { z } from "zod";
import twilio from "twilio";

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function registerRoutes(app: Express): Promise<Server> {
  // Real SMS sending function using Twilio
  const sendSMS = async (phoneNumber: string, message: string) => {
    try {
      const twilioMessage = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`SMS sent successfully to ${phoneNumber}: ${twilioMessage.sid}`);
      return true;
    } catch (error) {
      console.error(`Failed to send SMS to ${phoneNumber}:`, error);
      throw error;
    }
  };

  // Generate 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Service definitions with pricing and duration
  const services = [
    { name: "👑 THE KING PACKAGE", price: 100, duration: 60 },
    { name: "Haircut", price: 40, duration: 30 },
    { name: "Kids Haircut", price: 35, duration: 20 },
    { name: "Head Shave", price: 35, duration: 25 },
    { name: "Haircut + Beard Combo", price: 60, duration: 45 },
    { name: "Hair Dye", price: 35, duration: 60 },
    { name: "Beard Trim + Lineup", price: 25, duration: 20 },
    { name: "Hot Towel Shave with Steam", price: 35, duration: 30 },
    { name: "Beard Dye", price: 25, duration: 45 },
    { name: "Basic Facial", price: 45, duration: 30 },
    { name: "Face Threading", price: 25, duration: 15 },
    { name: "Eyebrow Threading", price: 15, duration: 10 },
    { name: "Full Face Wax", price: 30, duration: 25 },
    { name: "Ear Waxing", price: 10, duration: 5 },
    { name: "Nose Waxing", price: 10, duration: 5 },
    { name: "Shampoo", price: 5, duration: 10 }
  ];

  // Calculate pricing with Alex surcharge
  const calculatePrice = (serviceType: string, barber: string) => {
    const service = services.find(s => s.name === serviceType);
    const basePrice = service?.price || 0;
    const alexSurcharge = barber === "Alex" ? 5 : 0;
    return basePrice + alexSurcharge;
  };

  // Get service duration
  const getServiceDuration = (serviceType: string) => {
    const service = services.find(s => s.name === serviceType);
    return service?.duration || 30;
  };

  // Phone verification endpoints
  app.post("/api/send-verification", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createPhoneVerification({
        phoneNumber,
        verificationCode,
        expiresAt
      });

      await sendSMS(phoneNumber, `Your Kings Barber Shop verification code is: ${verificationCode}`);

      res.json({ success: true, message: "Verification code sent" });
    } catch (error) {
      console.error("Error sending verification:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.get("/api/get-verification-code/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      
      // Get the most recent verification code for this phone number
      const verification = await storage.getLatestVerificationCode(phoneNumber);
      
      if (!verification) {
        return res.status(404).json({ message: "No verification code found" });
      }

      res.json({ code: verification.verificationCode });
    } catch (error) {
      console.error("Error getting verification code:", error);
      res.status(500).json({ message: "Failed to get verification code" });
    }
  });

  app.post("/api/verify-phone", async (req, res) => {
    try {
      const { phoneNumber, verificationCode } = req.body;
      
      if (!phoneNumber || !verificationCode) {
        return res.status(400).json({ message: "Phone number and verification code are required" });
      }

      const isVerified = await storage.verifyPhone(phoneNumber, verificationCode);
      
      if (!isVerified) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }

      res.json({ success: true, message: "Phone number verified" });
    } catch (error) {
      console.error("Error verifying phone:", error);
      res.status(500).json({ message: "Failed to verify phone number" });
    }
  });

  // Booking endpoints
  app.post("/api/book-appointment", async (req, res) => {
    try {
      // Parse the request body and convert date properly
      const rawData = req.body;
      const processedData = {
        customerName: rawData.customerName,
        customerPhone: rawData.customerPhone,
        services: rawData.services || [rawData.serviceType], // Support both formats
        serviceType: rawData.serviceType || rawData.services?.[0] || '',
        barber: rawData.barber,
        appointmentDate: new Date(rawData.appointmentDate),
        notes: rawData.notes || '',
        totalPrice: rawData.totalPrice || calculatePrice(rawData.serviceType, rawData.barber).toString(),
        totalDuration: parseInt(rawData.totalDuration) || 30,
        status: 'confirmed'
      };
      
      const appointmentData = insertAppointmentSchema.parse(processedData);
      
      // CRITICAL: Double-check for appointment conflicts before creating the appointment
      const conflictDate = new Date(appointmentData.appointmentDate).toISOString().split('T')[0];
      const existingAppointments = await storage.getAppointmentsByBarberAndDate(appointmentData.barber, conflictDate);
      
      const proposedStart = new Date(appointmentData.appointmentDate);
      const proposedEnd = new Date(proposedStart);
      proposedEnd.setMinutes(proposedEnd.getMinutes() + appointmentData.totalDuration);
      
      // Check for actual conflicts - prevent overlaps but allow back-to-back appointments
      const hasConflict = existingAppointments.some(existing => {
        const existingStart = new Date(existing.appointmentDate);
        const existingEnd = new Date(existingStart);
        existingEnd.setMinutes(existingEnd.getMinutes() + (existing.totalDuration || 30));
        
        // Only prevent actual overlaps - appointments can be scheduled back-to-back
        return (proposedStart < existingEnd && proposedEnd > existingStart);
      });
      
      if (hasConflict) {
        return res.status(409).json({ 
          message: "This time slot conflicts with an existing appointment. Please choose a different time.", 
          error: "APPOINTMENT_CONFLICT" 
        });
      }
      
      const appointment = await storage.createAppointment(appointmentData);

      // Send SMS to all barbers at the verified number
      const barberPhone = "+14319973415"; // All barbers get notifications at this number
      const serviceDuration = appointment.totalDuration || 30;
      const endTime = new Date(appointment.appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + serviceDuration);
      
      const startTimeStr = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      });
      const endTimeStr = endTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      });
      
      const barberMessage = `NEW APPOINTMENT\n\nCustomer: ${appointment.customerName}\nPhone: ${appointment.customerPhone}\nService: ${appointment.serviceType} (${serviceDuration}min)\nAssigned Barber: ${appointment.barber}\nTime Slot: ${startTimeStr} - ${endTimeStr}\nNotes: ${appointment.notes || 'None'}\nConfirmation: ${appointment.confirmationCode}`;
      
      console.log(`Sending SMS to barber: ${barberPhone}`);
      console.log(`BARBER MESSAGE: ${barberMessage}`);
      try {
        const result = await sendSMS(barberPhone, barberMessage);
        console.log(`BARBER SMS SENT TO ${barberPhone}: success`);
      } catch (error) {
        console.error("BARBER SMS FAILED:", error);
      }

      // Send SMS to manager regardless of which barber booked
      const managerPhone = "+14319973415";
      const managerMessage = `MANAGER ALERT - Kings Barber Shop\n\nNEW APPOINTMENT\nCustomer: ${appointment.customerName}\nService: ${appointment.serviceType} (${serviceDuration}min)\nBarber: ${appointment.barber}\nTime: ${startTimeStr} - ${endTimeStr}\nTotal: $${appointment.totalPrice}`;
      
      try {
        await sendSMS(managerPhone, managerMessage);
        console.log(`MANAGER SMS SENT TO ${managerPhone}: success`);
      } catch (error) {
        console.error("MANAGER SMS FAILED:", error);
      }

      // Send confirmation SMS to customer with cancel/reschedule info
      const customerServiceDuration = appointment.totalDuration || 30;
      const customerEndTime = new Date(appointment.appointmentDate);
      customerEndTime.setMinutes(customerEndTime.getMinutes() + customerServiceDuration);
      
      const customerStartTime = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      });
      const customerEndTimeStr = customerEndTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      });
      
      const customerMessage = `Appointment confirmed at Kings Barber Shop!\n\nTime Slot: ${customerStartTime} - ${customerEndTimeStr} (${customerServiceDuration}min)\nService: ${appointment.serviceType}\nBarber: ${appointment.barber}\nTotal: $${appointment.totalPrice}\n\nCancel/Reschedule: ${appointment.confirmationCode}`;
      
      try {
        await sendSMS(appointment.customerPhone, customerMessage);
      } catch (error) {
        console.log("Note: Could not send SMS to customer - appointment still confirmed");
        console.log(`CUSTOMER NOTIFICATION: ${customerMessage}`);
      }

      res.json({ 
        success: true, 
        appointment: {
          ...appointment,
          customerPhone: undefined // Don't return phone in response
        }
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to book appointment" });
    }
  });

  // Middleware to check barber authentication - moved here for proper ordering
  const authenticateBarber = async (req: any, res: any, next: any) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      if (!sessionId) {
        return res.status(401).json({ error: 'No session provided' });
      }
      
      const session = await storage.getBarberSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }
      
      req.barberName = session.barberName;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  };

  // Walk-in booking endpoint for barbers
  app.post('/api/barber/book-walkin', authenticateBarber, async (req, res) => {
    try {
      const { barber, services, appointmentDate, totalDuration, totalPrice, code } = req.body;
      
      if (!code || !barber || !services || !appointmentDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const phoneNumber = barberPhones[barber];
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Invalid barber name' });
      }
      
      // Verify SMS code
      const isValid = await storage.verifyPhoneCode(phoneNumber, code);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Create walk-in appointment data
      const appointmentData = {
        customerName: "Walk-in Customer",
        customerPhone: "000-000-0000", // Placeholder for walk-ins
        services: Array.isArray(services) ? services : [services],
        serviceType: Array.isArray(services) ? services.join(', ') : services,
        barber,
        appointmentDate: new Date(appointmentDate),
        notes: "Walk-in booking by barber",
        totalPrice: totalPrice.toString(),
        totalDuration: parseInt(totalDuration),
        status: 'confirmed'
      };
      
      // Check for conflicts
      const conflictDate = new Date(appointmentData.appointmentDate).toISOString().split('T')[0];
      const existingAppointments = await storage.getAppointmentsByBarberAndDate(appointmentData.barber, conflictDate);
      
      const proposedStart = new Date(appointmentData.appointmentDate);
      const proposedEnd = new Date(proposedStart);
      proposedEnd.setMinutes(proposedEnd.getMinutes() + appointmentData.totalDuration);
      
      const hasConflict = existingAppointments.some(existing => {
        const existingStart = new Date(existing.appointmentDate);
        const existingEnd = new Date(existingStart);
        existingEnd.setMinutes(existingEnd.getMinutes() + (existing.totalDuration || 30));
        return (proposedStart < existingEnd && proposedEnd > existingStart);
      });
      
      if (hasConflict) {
        return res.status(409).json({ 
          error: "This time slot conflicts with an existing appointment." 
        });
      }
      
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send SMS notification to barber
      const serviceDuration = appointment.totalDuration || 30;
      const endTime = new Date(appointment.appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + serviceDuration);
      
      const startTimeStr = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      });
      const endTimeStr = endTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      });
      
      const barberMessage = `✅ WALK-IN BOOKED - Kings Barber Shop\n\n👤 Walk-in Customer\n✂️ Service: ${appointment.serviceType} (${serviceDuration}min)\n👨‍💼 Barber: ${appointment.barber}\n📅 Time Slot: ${startTimeStr} - ${endTimeStr}\n💰 Total: $${appointment.totalPrice}\n🔑 Confirmation: ${appointment.confirmationCode}`;
      
      try {
        await sendSMS(phoneNumber, barberMessage);
      } catch (error) {
        console.error("Failed to send walk-in SMS:", error);
      }
      
      res.json({ success: true, appointment });
    } catch (error) {
      console.error('Error booking walk-in:', error);
      res.status(500).json({ error: 'Failed to book walk-in appointment' });
    }
  });

  // Barber dashboard endpoints
  app.get("/api/appointments/:barber", async (req, res) => {
    try {
      const { barber } = req.params;
      const { date } = req.query;
      
      let appointments;
      if (date && typeof date === 'string') {
        // Get appointments for specific date
        appointments = await storage.getAppointmentsByBarberForDate(barber, date);
      } else {
        // Get all future appointments (from today onwards)
        appointments = await storage.getAppointmentsByBarber(barber);
      }
      
      // Remove sensitive customer data for barber dashboard
      const sanitizedAppointments = appointments.map(apt => ({
        id: apt.id,
        serviceType: apt.serviceType,
        appointmentDate: apt.appointmentDate,
        notes: apt.notes,
        totalPrice: apt.totalPrice,
        totalDuration: apt.totalDuration, // Include duration for proper time display
        status: apt.status
      }));

      res.json(sanitizedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Admin endpoint to reset all appointments
  app.post('/api/admin/reset-appointments', async (req, res) => {
    try {
      await storage.clearAllAppointments();
      res.json({ success: true, message: "All appointments cleared" });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear appointments' });
    }
  });



  // Store staff authentication endpoints
  app.post('/api/barber/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple hardcoded authentication for store staff
      if (username === 'testing123' && password === 'testing123') {
        // Create a general store session (not tied to specific barber)
        const session = await storage.createBarberSession('Store');
        res.json({ 
          success: true, 
          sessionId: session.sessionId,
          isStoreLogin: true
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Barber phone numbers mapping - all barbers use the same number for verification
  const barberPhones: Record<string, string> = {
    'Alex': '+14319973415',
    'Yazan': '+14319973415', 
    'Murad': '+14319973415',
    'Moe': '+14319973415'
  };

  // Send SMS verification for barber away days
  app.post('/api/barber/send-verification', authenticateBarber, async (req, res) => {
    try {
      const { barberName } = req.body;
      
      if (!barberName) {
        return res.status(400).json({ error: 'Barber name is required' });
      }
      
      const phoneNumber = barberPhones[barberName];
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Invalid barber name' });
      }
      
      const code = generateVerificationCode();
      
      // Store verification code temporarily with barber name
      await storage.storePhoneVerification(phoneNumber, code);
      
      // Send SMS
      const message = `Kings Barber Shop - Your verification code for ${barberName}'s schedule: ${code}`;
      await sendSMS(phoneNumber, message);
      
      res.json({ 
        success: true, 
        message: 'Verification code sent',
        phoneNumber // Return phone number so frontend knows where it was sent
      });
    } catch (error) {
      console.error('SMS error:', error);
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  });

  // Verify SMS code and add away days
  app.post('/api/barber/verify-and-add-away-days', authenticateBarber, async (req, res) => {
    try {
      const { code, dates, barberName } = req.body;
      
      if (!code || !Array.isArray(dates) || !barberName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const phoneNumber = barberPhones[barberName];
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Invalid barber name' });
      }
      
      // Verify SMS code
      const isValid = await storage.verifyPhoneCode(phoneNumber, code);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Add away days for the specified barber
      const awayDays = await storage.addBarberAwayDays(barberName, dates);
      res.json({ success: true, awayDays });
    } catch (error) {
      console.error('Error adding away days:', error);
      res.status(500).json({ error: 'Failed to add away days' });
    }
  });

  // Barber logout
  app.post('/api/barber/logout', authenticateBarber, async (req: any, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      await storage.deleteBarberSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Get all barbers' away days
  app.get('/api/barber/away-days', authenticateBarber, async (req: any, res) => {
    try {
      const allAwayDays = await storage.getAllBarbersAwayDays();
      res.json(allAwayDays);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch away days' });
    }
  });

  // Verify SMS code and remove away day
  app.post('/api/barber/verify-and-remove-away-day', authenticateBarber, async (req, res) => {
    try {
      const { code, barberName, date } = req.body;
      
      if (!code || !barberName || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const phoneNumber = barberPhones[barberName];
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Invalid barber name' });
      }
      
      // Verify SMS code
      const isValid = await storage.verifyPhoneCode(phoneNumber, code);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Remove away day for the specified barber
      await storage.removeBarberAwayDay(barberName, date);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing away day:', error);
      res.status(500).json({ error: 'Failed to remove away day' });
    }
  });

  // Get available time slots for multiple services with total duration
  app.get('/api/available-slots/:barber/:date/:duration', async (req, res) => {
    try {
      const { barber, date, duration } = req.params;
      const totalDuration = parseInt(duration);
      // Check if barber is away on this date
      const isAway = await storage.isBarberAway(barber, date);
      if (isAway) {
        console.log(`${barber} is away on ${date} - no slots available`);
        return res.json({ error: false, data: [], message: `${barber} is away on this date` }); // No slots available if barber is away
      }

      const existingAppointments = await storage.getAppointmentsByBarberAndDate(barber, date);
      
      // Generate all possible time slots for the day
      const slots = [];
      
      // Simple approach: Always show shop hours 11 AM - 8 PM regardless of user location
      const targetDate = new Date(date + 'T00:00:00');
      
      const startHour = 11; // 11 AM
      const endHour = 20; // 8 PM
      
      console.log(`Generating slots for date: ${date}, Shop hours: ${startHour}:00 - ${endHour}:00`);
      
      // Generate slots every 15 minutes
      const slotInterval = 15;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const slotStart = new Date(targetDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);
          
          // Don't allow appointments that would end after 8 PM
          if (slotEnd.getHours() >= 20 || (slotEnd.getHours() === 20 && slotEnd.getMinutes() > 0)) continue;
          
          // No time filtering - show all shop hours regardless of current time
          // Customers can book any available slot during shop hours
          
          // Check if this slot conflicts with existing appointments
          const hasConflict = existingAppointments.some(appointment => {
            const existingStart = new Date(appointment.appointmentDate);
            // Parse total duration from appointment (stored as duration in minutes)
            const existingDuration = appointment.totalDuration || 30;
            const existingEnd = new Date(existingStart);
            existingEnd.setMinutes(existingEnd.getMinutes() + existingDuration);
            
            // FIXED: Proper overlap prevention - only prevent actual overlaps, not excessive gaps
            // A slot conflicts if it starts before existing ends OR ends after existing starts
            // But we allow appointments to be scheduled right after each other (back-to-back)
            return (slotStart < existingEnd && slotEnd > existingStart);
          });
          
          if (!hasConflict) {
            const timeStr = slotStart.toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            
            const endTimeStr = slotEnd.toLocaleString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            
            slots.push({
              value: slotStart.toISOString(),
              label: `${timeStr} - ${endTimeStr} (${totalDuration}min total)`
            });
          }
        }
      }
      
      res.json(slots);
    } catch (error) {
      console.error('Error generating slots:', error);
      res.status(500).json({ error: 'Failed to fetch available slots' });
    }
  });

  // Appointment management endpoints
  app.get("/api/appointment/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const appointment = await storage.getAppointmentByCode(code);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.put("/api/appointment/:code/reschedule", async (req, res) => {
    try {
      const { code } = req.params;
      const { appointmentDate, barber, services, totalPrice, totalDuration } = req.body;
      
      const appointment = await storage.getAppointmentByCode(code);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check for appointment conflicts with the new time slot
      const appointmentTime = new Date(appointmentDate);
      const isConflict = await storage.hasAppointmentConflict(
        barber, 
        appointmentTime, 
        totalDuration || 30,
        appointment.id // Exclude current appointment from conflict check
      );
      
      if (isConflict) {
        return res.status(409).json({ 
          message: "This time slot conflicts with an existing appointment. Please choose a different time.", 
          error: "APPOINTMENT_CONFLICT" 
        });
      }

      const updatedAppointment = await storage.updateAppointment(appointment.id, {
        appointmentDate: new Date(appointmentDate),
        barber: barber || appointment.barber,
        services: services || appointment.services,
        serviceType: Array.isArray(services) ? services.join(', ') : appointment.serviceType,
        totalPrice: totalPrice || appointment.totalPrice,
        totalDuration: totalDuration || appointment.totalDuration
      });

      if (updatedAppointment) {
        // Notify barber of reschedule
        const barberPhone = "+14319973415";
        const serviceDuration = updatedAppointment.totalDuration || 30;
        const endTime = new Date(updatedAppointment.appointmentDate);
        endTime.setMinutes(endTime.getMinutes() + serviceDuration);
        
        const startTimeStr = new Date(updatedAppointment.appointmentDate).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true
        });
        const endTimeStr = endTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true
        });
        
        try {
          const barberMessage = `APPOINTMENT RESCHEDULED - Kings Barber Shop\n\nCustomer: ${updatedAppointment.customerName}\nService: ${updatedAppointment.serviceType} (${serviceDuration}min)\nBarber: ${updatedAppointment.barber}\nNEW Time: ${startTimeStr} - ${endTimeStr}\nTotal: $${updatedAppointment.totalPrice}\nCode: ${updatedAppointment.confirmationCode}`;
          await sendSMS(barberPhone, barberMessage);
        } catch (error) {
          console.log("Could not notify barber of reschedule");
        }

        // Notify customer with updated cancel/reschedule codes  
        const rescheduleServiceDuration = updatedAppointment.totalDuration || 30;
        const rescheduleEndTime = new Date(updatedAppointment.appointmentDate);
        rescheduleEndTime.setMinutes(rescheduleEndTime.getMinutes() + rescheduleServiceDuration);
        
        const customerStartTime = new Date(updatedAppointment.appointmentDate).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true
        });
        const customerEndTimeStr = rescheduleEndTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true
        });

        // Send SMS to manager for reschedule
        const managerPhone = "+14319973415";
        const managerRescheduleMessage = `APPOINTMENT RESCHEDULED - Kings Barber Shop\n\nCustomer: ${updatedAppointment.customerName}\nService: ${updatedAppointment.serviceType}\nBarber: ${updatedAppointment.barber}\nNew Time: ${customerStartTime} - ${customerEndTimeStr}\nTotal: $${updatedAppointment.totalPrice}`;
        
        try {
          await sendSMS(managerPhone, managerRescheduleMessage);
        } catch (error) {
          console.log("Could not notify manager of reschedule");
        }
        
        const customerMessage = `Your Kings Barber Shop appointment has been rescheduled!\n\nTime Slot: ${customerStartTime} - ${customerEndTimeStr} (${rescheduleServiceDuration}min)\nService: ${updatedAppointment.serviceType}\nBarber: ${updatedAppointment.barber}\nTotal: $${updatedAppointment.totalPrice}\n\nCancel/Reschedule: ${updatedAppointment.confirmationCode}`;
        
        try {
          // Only send SMS if phone number is valid (not 000-000-0000)
          if (updatedAppointment.customerPhone && !updatedAppointment.customerPhone.includes('000-000-0000')) {
            await sendSMS(updatedAppointment.customerPhone, customerMessage);
          } else {
            console.log("Note: Customer phone number invalid, skipping SMS");
            console.log(`CUSTOMER NOTIFICATION: ${customerMessage}`);
          }
        } catch (error) {
          console.log("Note: Could not send SMS to customer - appointment still rescheduled");
          console.log(`CUSTOMER NOTIFICATION: ${customerMessage}`);
        }
      }

      res.json({ success: true, appointment: updatedAppointment });
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      res.status(500).json({ message: "Failed to reschedule appointment" });
    }
  });

  app.delete("/api/appointment/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const appointment = await storage.getAppointmentByCode(code);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const cancelled = await storage.cancelAppointment(appointment.id);
      
      if (!cancelled) {
        return res.status(500).json({ message: "Failed to cancel appointment" });
      }

      // Appointment successfully cancelled - send response immediately
      res.json({ success: true, message: "Appointment cancelled" });

      // Send SMS notifications asynchronously (don't let failures affect the response)
      setImmediate(async () => {
        try {
          // Notify barber of cancellation
          const barberPhone = "+14319973415";
          const serviceDuration = appointment.totalDuration || 30;
          const endTime = new Date(appointment.appointmentDate);
          endTime.setMinutes(endTime.getMinutes() + serviceDuration);
          
          const startTimeStr = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true
          });
          const endTimeStr = endTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true
          });
          
          try {
            const barberMessage = `APPOINTMENT CANCELLED\n\nService: ${appointment.serviceType} (${serviceDuration}min)\nBarber: ${appointment.barber}\nWas scheduled: ${startTimeStr} - ${endTimeStr}\nConfirmation Code: ${appointment.confirmationCode}`;
            await sendSMS(barberPhone, barberMessage);
          } catch (error) {
            console.log("Could not notify barber of cancellation");
          }

          // Send SMS to manager for cancellation
          const managerPhone = "+14319973415";
          try {
            const managerCancelMessage = `MANAGER ALERT - Kings Barber Shop\n\nAPPOINTMENT CANCELLED\nCustomer: ${appointment.customerName}\nService: ${appointment.serviceType} (${serviceDuration}min)\nBarber: ${appointment.barber}\nWas scheduled: ${startTimeStr} - ${endTimeStr}\nTotal: $${appointment.totalPrice}`;
            await sendSMS(managerPhone, managerCancelMessage);
          } catch (error) {
            console.log("Could not notify manager of cancellation");
          }

          // Notify customer of cancellation
          try {
            const customerMessage = `❌ Your Kings Barber Shop appointment has been cancelled.\n\n📅 Time Slot: ${startTimeStr} - ${endTimeStr} (${serviceDuration}min)\n✂️ Service: ${appointment.serviceType}\n👨‍💼 Barber: ${appointment.barber}\n🔑 Cancelled Code: ${appointment.confirmationCode}\n\nTo book a new appointment, visit our website or call (714) 499-1906.\n\nThank you!`;
            await sendSMS(appointment.customerPhone, customerMessage);
          } catch (error) {
            console.log("Note: Could not send SMS to customer - appointment still cancelled");
          }
        } catch (error) {
          console.log("Error in SMS notifications:", error);
        }
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
