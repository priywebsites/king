import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertPhoneVerificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to simulate SMS sending
  const sendSMS = async (phoneNumber: string, message: string) => {
    console.log(`SMS to ${phoneNumber}: ${message}`);
    // In production, integrate with Twilio or similar service
    return true;
  };

  // Generate 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Calculate pricing with Alex surcharge
  const calculatePrice = (serviceType: string, barber: string) => {
    const servicePrices: Record<string, number> = {
      "👑 THE KING PACKAGE": 100,
      "Haircut": 40,
      "Kids Haircut": 35,
      "Head Shave": 35,
      "Haircut + Beard Combo": 60,
      "Hair Dye": 35,
      "Beard Trim + Lineup": 25,
      "Hot Towel Shave with Steam": 35,
      "Beard Dye": 25,
      "Basic Facial": 45,
      "Face Threading": 25,
      "Eyebrow Threading": 15,
      "Full Face Wax": 30,
      "Ear Waxing": 10,
      "Nose Waxing": 10,
      "Shampoo": 5
    };

    const basePrice = servicePrices[serviceType] || 0;
    const alexSurcharge = barber === "Alex" ? 5 : 0;
    return basePrice + alexSurcharge;
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
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Calculate total price
      const totalPrice = calculatePrice(appointmentData.serviceType, appointmentData.barber).toString();
      
      const appointment = await storage.createAppointment({
        ...appointmentData,
        totalPrice
      });

      // Send SMS to barber
      const barberMessage = `NEW APPOINTMENT:\nName: ${appointment.customerName}\nNumber: ${appointment.customerPhone}\nService: ${appointment.serviceType}\nTime: ${new Date(appointment.appointmentDate).toLocaleString()}\nNotes: ${appointment.notes || 'None'}`;
      await sendSMS("111-111-1111", barberMessage);

      // Send confirmation SMS to customer
      const customerMessage = `Appointment confirmed at Kings Barber Shop!\nService: ${appointment.serviceType}\nBarber: ${appointment.barber}\nTime: ${new Date(appointment.appointmentDate).toLocaleString()}\nTotal: $${appointment.totalPrice}\nConfirmation Code: ${appointment.confirmationCode}\nUse this code to reschedule or cancel.`;
      await sendSMS(appointment.customerPhone, customerMessage);

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
      const appointments = await storage.getAppointmentsByBarber(barber);
      
      // Remove sensitive customer data for barber dashboard
      const sanitizedAppointments = appointments.map(apt => ({
        id: apt.id,
        serviceType: apt.serviceType,
        appointmentDate: apt.appointmentDate,
        notes: apt.notes,
        totalPrice: apt.totalPrice,
        status: apt.status
      }));

      res.json(sanitizedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
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
        const barberMessage = `APPOINTMENT RESCHEDULED:\nName: ${updatedAppointment.customerName}\nService: ${updatedAppointment.serviceType}\nNew Time: ${new Date(updatedAppointment.appointmentDate).toLocaleString()}\nCode: ${updatedAppointment.confirmationCode}`;
        await sendSMS("111-111-1111", barberMessage);

        // Notify customer
        const customerMessage = `Your appointment has been rescheduled!\nNew Time: ${new Date(updatedAppointment.appointmentDate).toLocaleString()}\nCode: ${updatedAppointment.confirmationCode}`;
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
        const barberMessage = `APPOINTMENT CANCELLED:\nName: ${appointment.customerName}\nService: ${appointment.serviceType}\nTime: ${new Date(appointment.appointmentDate).toLocaleString()}\nCode: ${appointment.confirmationCode}`;
        await sendSMS("111-111-1111", barberMessage);

        // Notify customer
        const customerMessage = `Your appointment has been cancelled.\nIf you'd like to book again, please visit our website.`;
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
