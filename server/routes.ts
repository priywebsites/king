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
      
      // Check for conflicts with ultra-strict 5-minute buffer
      const hasConflict = existingAppointments.some(existing => {
        const existingStart = new Date(existing.appointmentDate);
        const existingEnd = new Date(existingStart);
        existingEnd.setMinutes(existingEnd.getMinutes() + (existing.totalDuration || 30));
        
        // 5-minute buffer protection
        const bufferTime = 5;
        const existingStartBuffer = new Date(existingStart);
        existingStartBuffer.setMinutes(existingStartBuffer.getMinutes() - bufferTime);
        const existingEndBuffer = new Date(existingEnd);
        existingEndBuffer.setMinutes(existingEndBuffer.getMinutes() + bufferTime);
        
        return (proposedStart < existingEndBuffer && proposedEnd > existingStartBuffer);
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
      
      const barberMessage = `🆕 NEW APPOINTMENT - Kings Barber Shop\n\n👤 Customer: ${appointment.customerName}\n📞 Phone: ${appointment.customerPhone}\n✂️ Service: ${appointment.serviceType} (${serviceDuration}min)\n👨‍💼 Assigned Barber: ${appointment.barber}\n📅 Time Slot: ${startTimeStr} - ${endTimeStr}\n💰 Total: $${appointment.totalPrice}\n📝 Notes: ${appointment.notes || 'None'}\n🔑 Confirmation: ${appointment.confirmationCode}`;
      
      console.log(`Sending SMS to barber: ${barberPhone}`);
      console.log(`BARBER MESSAGE: ${barberMessage}`);
      try {
        const result = await sendSMS(barberPhone, barberMessage);
        console.log(`BARBER SMS SENT TO ${barberPhone}: success`);
      } catch (error) {
        console.error("BARBER SMS FAILED:", error);
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
      
      const customerMessage = `✅ Appointment confirmed at Kings Barber Shop!\n\n📅 Time Slot: ${customerStartTime} - ${customerEndTimeStr} (${customerServiceDuration}min)\n✂️ Service: ${appointment.serviceType}\n👨‍💼 Barber: ${appointment.barber}\n💰 Total: $${appointment.totalPrice}\n\n🔑 Confirmation Code: ${appointment.confirmationCode}\n\n📸 IMPORTANT: Take a screenshot of this code and save it! You'll need it to cancel or reschedule.\n\n📲 TO CANCEL: Reply "CANCEL ${appointment.confirmationCode}"\n📲 TO RESCHEDULE: Reply "RESCHEDULE ${appointment.confirmationCode}"\n📞 FORGOT CODE? Call us at (714) 499-1906\n\n📍 221 S Magnolia Ave, Anaheim`;
      
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

  // Get available time slots for multiple services with total duration
  app.get('/api/available-slots/:barber/:date/:duration', async (req, res) => {
    try {
      const { barber, date, duration } = req.params;
      const totalDuration = parseInt(duration);
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
            
            // CRITICAL: Ultra-strict overlap prevention with 5-minute buffer between appointments
            // This ensures there's always a 5-minute gap between any two appointments
            const bufferTime = 5; // 5 minutes buffer
            const existingStartBuffer = new Date(existingStart);
            existingStartBuffer.setMinutes(existingStartBuffer.getMinutes() - bufferTime);
            const existingEndBuffer = new Date(existingEnd);
            existingEndBuffer.setMinutes(existingEndBuffer.getMinutes() + bufferTime);
            
            return (slotStart < existingEndBuffer && slotEnd > existingStartBuffer);
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
      const { appointmentDate } = req.body;
      
      const appointment = await storage.getAppointmentByCode(code);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const updatedAppointment = await storage.updateAppointment(appointment.id, {
        appointmentDate: new Date(appointmentDate)
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
          const barberMessage = `📅 APPOINTMENT RESCHEDULED - Kings Barber Shop\n\n✂️ Service: ${updatedAppointment.serviceType} (${serviceDuration}min)\n👨‍💼 Barber: ${updatedAppointment.barber}\n📅 NEW Time Slot: ${startTimeStr} - ${endTimeStr}\n🔑 Confirmation Code: ${updatedAppointment.confirmationCode}`;
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
        
        const customerMessage = `✅ Your Kings Barber Shop appointment has been rescheduled!\n\n📅 Time Slot: ${customerStartTime} - ${customerEndTimeStr} (${rescheduleServiceDuration}min)\n✂️ Service: ${updatedAppointment.serviceType}\n👨‍💼 Barber: ${updatedAppointment.barber}\n💰 Total: $${updatedAppointment.totalPrice}\n\n🔑 Confirmation Code: ${updatedAppointment.confirmationCode}\n\n📲 TO CANCEL: Reply "CANCEL ${updatedAppointment.confirmationCode}"\n📲 TO RESCHEDULE: Reply "RESCHEDULE ${updatedAppointment.confirmationCode}"\n\n📍 221 S Magnolia Ave, Anaheim\n📞 (714) 499-1906`;
        await sendSMS(updatedAppointment.customerPhone, customerMessage);
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
      
      if (cancelled) {
        // Notify barber of cancellation
        const barberPhone = "+14319973415";
        try {
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
          
          const barberMessage = `❌ APPOINTMENT CANCELLED - Kings Barber Shop\n\n✂️ Service: ${appointment.serviceType} (${serviceDuration}min)\n👨‍💼 Barber: ${appointment.barber}\n📅 Was scheduled: ${startTimeStr} - ${endTimeStr}\n🔑 Confirmation Code: ${appointment.confirmationCode}`;
          await sendSMS(barberPhone, barberMessage);
        } catch (error) {
          console.log("Could not notify barber of cancellation");
        }

        // Notify customer of cancellation
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
        
        const customerMessage = `❌ Your Kings Barber Shop appointment has been cancelled.\n\n📅 Time Slot: ${startTimeStr} - ${endTimeStr} (${serviceDuration}min)\n✂️ Service: ${appointment.serviceType}\n👨‍💼 Barber: ${appointment.barber}\n🔑 Cancelled Code: ${appointment.confirmationCode}\n\nTo book a new appointment, visit our website or call (714) 499-1906.\n\nThank you!`;
        await sendSMS(appointment.customerPhone, customerMessage);
      }

      res.json({ success: true, message: "Appointment cancelled" });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
