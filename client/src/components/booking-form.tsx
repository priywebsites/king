import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Phone, User, Scissors, Clock, DollarSign, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CalendarPicker from "./calendar-picker";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  barber: z.string().min(1, "Please select a barber"),
  appointmentDate: z.string().min(1, "Please select date and time"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  selectedService?: string;
  onClose: () => void;
}

export default function BookingForm({ selectedService, onClose }: BookingFormProps) {
  const [step, setStep] = useState<'form' | 'phone-verification' | 'confirmation'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(selectedService ? [selectedService] : []);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{value: string, label: string}[]>([]);
  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      services: selectedService ? [selectedService] : [],
      barber: '',
      appointmentDate: '',
      notes: '',
    },
  });

  const services = [
    { name: "👑 THE KING PACKAGE", price: 100, duration: 60 }, // 1 hour full service
    { name: "Haircut", price: 40, duration: 30 },
    { name: "Kids Haircut", price: 35, duration: 20 },
    { name: "Head Shave", price: 35, duration: 25 },
    { name: "Haircut + Beard Combo", price: 60, duration: 45 },
    { name: "Hair Dye", price: 35, duration: 60 }, // longer process
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

  const barbers = ["Alex", "Yazan", "Murad", "Moe"];

  // Calculate total pricing and duration for multiple services
  const calculateTotals = (serviceNames: string[], barber: string) => {
    let totalPrice = 0;
    let totalDuration = 0;
    
    serviceNames.forEach(serviceName => {
      const service = services.find(s => s.name === serviceName);
      if (service) {
        totalPrice += service.price;
        totalDuration += service.duration;
      }
    });
    
    // Alex surcharge applies per appointment, not per service
    const alexSurcharge = barber === "Alex" ? 5 : 0;
    return { totalPrice: totalPrice + alexSurcharge, totalDuration };
  };

  // Watch for form changes
  const watchedServices = form.watch("services");
  const watchedBarber = form.watch("barber");

  const [availableSlots, setAvailableSlots] = useState<{value: string, label: string}[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Update price and duration when services or barber changes
  React.useEffect(() => {
    if (watchedServices && watchedBarber && Array.isArray(watchedServices)) {
      const { totalPrice: newPrice, totalDuration: newDuration } = calculateTotals(watchedServices, watchedBarber);
      setTotalPrice(newPrice);
      setTotalDuration(newDuration);
    }
  }, [watchedServices, watchedBarber]);

  // Fetch time slots when date, services, or barber changes
  React.useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !watchedServices || !watchedBarber || !Array.isArray(watchedServices) || watchedServices.length === 0 || totalDuration === 0) {
        setAvailableTimeSlots([]);
        return;
      }

      setTimeSlotsLoading(true);
      try {
        console.log('BookingForm: Fetching slots for date:', selectedDate);
        const response = await apiRequest(`/api/available-slots/${encodeURIComponent(watchedBarber)}/${selectedDate}/${totalDuration}`);
        // Ensure response is always an array to prevent map errors
        if (response && Array.isArray(response.data)) {
          setAvailableTimeSlots(response.data);
        } else if (response && Array.isArray(response)) {
          setAvailableTimeSlots(response);
        } else {
          console.warn('Invalid time slots response format:', response);
          setAvailableTimeSlots([]);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setAvailableTimeSlots([]);
      } finally {
        setTimeSlotsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, watchedServices, watchedBarber, totalDuration]);

  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      await apiRequest('/api/send-verification', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber })
      });
      
      setStep('phone-verification');
      toast({
        title: "Verification Code Sent",
        description: "Check your phone for the 6-digit verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      await apiRequest('/api/verify-phone', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: form.getValues('customerPhone'),
          verificationCode
        })
      });

      // Phone verified, now book the appointment
      await bookAppointment();
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid or expired verification code.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const bookAppointment = async () => {
    try {
      const formData = form.getValues();
      const response = await apiRequest('/api/book-appointment', {
        method: 'POST',
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          services: formData.services,
          serviceType: formData.services[0] || '', // Main service for display
          barber: formData.barber,
          appointmentDate: formData.appointmentDate,
          notes: formData.notes || '',
          totalPrice: totalPrice.toString(),
          totalDuration: totalDuration
        })
      });

      setAppointment(response.appointment);
      setStep('confirmation');
      
      // Invalidate barber dashboard cache for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been confirmed.",
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    await sendVerificationCode(data.customerPhone);
  };

  // timeSlots are now fetched dynamically via availableSlots

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-dark-gray rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border-gray"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-montserrat font-bold">📅 Book Appointment</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-medium-gray"
          >
            <X size={24} />
          </Button>
        </div>

        {step === 'form' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <User className="mr-2" size={16} />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          className="bg-medium-gray border-border-gray text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <Phone className="mr-2" size={16} />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(555) 123-4567" 
                          className="bg-medium-gray border-border-gray text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <Scissors className="mr-2" size={16} />
                        Services ({selectedServices.length} selected)
                      </FormLabel>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {services.map((service) => (
                          <div key={service.name} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={service.name}
                              checked={selectedServices.includes(service.name)}
                              onChange={(e) => {
                                let newServices;
                                if (e.target.checked) {
                                  newServices = [...selectedServices, service.name];
                                } else {
                                  newServices = selectedServices.filter(s => s !== service.name);
                                }
                                setSelectedServices(newServices);
                                field.onChange(newServices);
                              }}
                              className="rounded border-border-gray"
                            />
                            <label 
                              htmlFor={service.name} 
                              className="text-white text-sm cursor-pointer flex-1"
                            >
                              {service.name} - ${service.price} ({service.duration}min)
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <User className="mr-2" size={16} />
                        Barber {watchedBarber === "Alex" && <span className="text-yellow-400 ml-2">(+$5)</span>}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                            <SelectValue placeholder="Select a barber" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-medium-gray border-border-gray">
                          {barbers.map((barber) => (
                            <SelectItem key={barber} value={barber} className="text-white hover:bg-border-gray">
                              {barber} {barber === "Alex" && <span className="text-yellow-400">(+$5)</span>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Calendar Date Selection */}
              {selectedServices.length > 0 && watchedBarber && (
                <CalendarPicker
                  selectedDate={selectedDate}
                  onDateSelect={(date) => {
                    console.log('BookingForm: Received date from calendar:', date);
                    setSelectedDate(date);
                    // Clear the appointment date when date changes
                    form.setValue('appointmentDate', '');
                  }}
                  maxDaysAdvance={7}
                />
              )}

              {/* Time Slot Selection */}
              {selectedDate && (
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <Clock className="mr-2" size={16} />
                        Available Time Slots
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                            <SelectValue placeholder={
                              timeSlotsLoading 
                                ? "Loading available times..." 
                                : "Choose your preferred time"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-medium-gray border-border-gray max-h-60">
                          {timeSlotsLoading ? (
                            <div className="p-4 text-center text-white">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                              <p className="mt-2 text-sm">Finding available times...</p>
                            </div>
                          ) : !Array.isArray(availableTimeSlots) || availableTimeSlots.length === 0 ? (
                            <div className="p-4 text-center text-light-gray">
                              {!Array.isArray(availableTimeSlots) ? "Error loading time slots" : "No available time slots for this date"}
                            </div>
                          ) : (
                            availableTimeSlots.map((slot: {value: string, label: string}) => (
                              <SelectItem key={slot.value} value={slot.value} className="text-white hover:bg-border-gray">
                                {slot.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requests or notes..."
                        className="bg-medium-gray border-border-gray text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedServices.length > 0 && watchedBarber && (
                <div className="bg-medium-gray p-4 rounded-lg border border-border-gray">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold flex items-center">
                        <DollarSign className="mr-2" size={16} />
                        Total Price:
                      </span>
                      <span className="text-2xl font-bold text-yellow-400">${totalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold flex items-center">
                        <Clock className="mr-2" size={16} />
                        Total Duration:
                      </span>
                      <span className="text-blue-400 font-bold">{totalDuration} minutes</span>
                    </div>
                    {watchedBarber === "Alex" && (
                      <p className="text-yellow-400 text-sm mt-2">
                        Includes $5 premium barber surcharge
                      </p>
                    )}
                    <div className="mt-2 pt-2 border-t border-border-gray">
                      <span className="text-light-gray text-sm">Selected: {selectedServices.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-200 font-montserrat font-bold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Processing..." : "Continue to Verification"}
              </Button>
            </form>
          </Form>
        )}

        {step === 'phone-verification' && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-montserrat font-bold mb-2">Verify Your Phone</h3>
              <p className="text-light-gray">
                We sent a 6-digit code to {form.getValues('customerPhone')}
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-medium-gray border-border-gray text-white text-center text-2xl tracking-widest"
                maxLength={6}
              />
              
              <Button
                onClick={verifyPhoneCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full bg-white text-black hover:bg-gray-200 font-montserrat font-bold"
              >
                {isVerifying ? "Verifying..." : "Verify & Book Appointment"}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => sendVerificationCode(form.getValues('customerPhone'))}
                className="w-full text-light-gray hover:text-white"
              >
                Resend Code
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && appointment && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-2xl font-montserrat font-bold mb-2 text-green-400">
                🎉 Appointment Confirmed!
              </h3>
              <p className="text-light-gray">
                Your appointment has been successfully booked
              </p>
            </div>

            <div className="bg-medium-gray p-6 rounded-lg border border-border-gray space-y-4">
              <div className="text-left space-y-2">
                <p><span className="text-light-gray">Service:</span> <span className="text-white font-semibold">{appointment.serviceType}</span></p>
                <p><span className="text-light-gray">Barber:</span> <span className="text-white font-semibold">{appointment.barber}</span></p>
                <p><span className="text-light-gray">Date & Time:</span> <span className="text-white font-semibold">{new Date(appointment.appointmentDate).toLocaleString()}</span></p>
                <p><span className="text-light-gray">Total:</span> <span className="text-yellow-400 font-bold text-xl">${appointment.totalPrice}</span></p>
              </div>
              
              <div className="border-t border-border-gray pt-4">
                <p className="text-light-gray text-sm mb-2">Your confirmation code:</p>
                <p className="text-2xl font-bold text-yellow-400 tracking-widest bg-black/30 py-2 px-4 rounded">
                  {appointment.confirmationCode}
                </p>
                <p className="text-yellow-400 text-sm mt-2">
                  Save this code to reschedule or cancel your appointment
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onClose}
                className="w-full bg-white text-black hover:bg-gray-200 font-montserrat font-bold"
              >
                Done
              </Button>
              
              <p className="text-light-gray text-sm">
                You'll receive SMS confirmations at {form.getValues('customerPhone')}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}