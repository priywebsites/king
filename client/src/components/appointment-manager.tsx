import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X, Search, Calendar, Clock, User, Phone, Scissors, DollarSign, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppointmentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentManager({ isOpen, onClose }: AppointmentManagerProps) {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [appointmentFound, setAppointmentFound] = useState<any>(null);
  const [step, setStep] = useState<'search' | 'manage'>('search');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const { toast } = useToast();

  const searchAppointment = async () => {
    if (!confirmationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter your confirmation code.",
        variant: "destructive",
      });
      return;
    }

    try {
      const appointment = await apiRequest(`/api/appointment/${confirmationCode.trim()}`);
      setAppointmentFound(appointment);
      setStep('manage');
    } catch (error) {
      toast({
        title: "Appointment Not Found",
        description: "Please check your confirmation code and try again.",
        variant: "destructive",
      });
    }
  };

  const rescheduleMutation = useMutation({
    mutationFn: async (newDate: string) => {
      return apiRequest(`/api/appointment/${confirmationCode}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentDate: newDate })
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment Rescheduled",
        description: "Your appointment has been successfully rescheduled.",
      });
      setAppointmentFound(null);
      setConfirmationCode('');
      setRescheduleDate('');
      setStep('search');
    },
    onError: () => {
      toast({
        title: "Reschedule Failed",
        description: "Failed to reschedule appointment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/appointment/${confirmationCode}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
      setAppointmentFound(null);
      setConfirmationCode('');
      setStep('search');
    },
    onError: () => {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let day = 1; day <= 14; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      // Skip Sundays (0) and Mondays (1)
      if (date.getDay() === 0 || date.getDay() === 1) continue;
      
      // Generate 15-minute intervals from 9 AM to 7 PM
      for (let hour = 9; hour < 19; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const timeSlot = new Date(date);
          timeSlot.setHours(hour, minute, 0, 0);
          
          const timeStr = timeSlot.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          slots.push({
            value: timeSlot.toISOString(),
            label: timeStr
          });
        }
      }
    }
    
    return slots;
  };

  const handleReschedule = () => {
    if (!rescheduleDate) {
      toast({
        title: "Date Required",
        description: "Please select a new date and time.",
        variant: "destructive",
      });
      return;
    }
    rescheduleMutation.mutate(rescheduleDate);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      cancelMutation.mutate();
    }
  };

  const timeSlots = generateTimeSlots();

  if (!isOpen) return null;

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
          <h2 className="text-3xl font-montserrat font-bold">🔁 Cancel/Reschedule</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-medium-gray"
          >
            <X size={24} />
          </Button>
        </div>

        {step === 'search' && (
          <div className="space-y-6">
            <div>
              <p className="text-light-gray mb-4">
                Enter your confirmation code to manage your appointment.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Confirmation Code</label>
                  <Input
                    type="text"
                    placeholder="Enter your code (e.g., ABC123XY)"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                    className="bg-medium-gray border-border-gray text-white"
                    onKeyPress={(e) => e.key === 'Enter' && searchAppointment()}
                  />
                </div>
                
                <Button
                  onClick={searchAppointment}
                  className="w-full bg-white text-black hover:bg-gray-200 font-montserrat font-bold"
                  disabled={!confirmationCode.trim()}
                >
                  <Search className="mr-2" size={16} />
                  Find Appointment
                </Button>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-400 text-sm">
                  <p className="font-semibold mb-1">Need your confirmation code?</p>
                  <p>Check the SMS confirmation we sent you when you booked your appointment.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'manage' && appointmentFound && (
          <div className="space-y-6">
            <div className="bg-medium-gray rounded-lg p-6 border border-border-gray">
              <h3 className="text-xl font-semibold text-white mb-4">Current Appointment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-white">
                    <User className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Name: {appointmentFound.customerName}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Phone className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Phone: {appointmentFound.customerPhone}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Scissors className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Service: {appointmentFound.serviceType}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-white">
                    <User className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Barber: {appointmentFound.barber}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Calendar className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Date: {new Date(appointmentFound.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                    <span>Time: {new Date(appointmentFound.appointmentDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border-gray">
                <div className="flex items-center justify-between">
                  <span className="text-light-gray">Total Price:</span>
                  <span className="text-2xl font-bold text-yellow-400">${appointmentFound.totalPrice}</span>
                </div>
              </div>
              
              {appointmentFound.notes && (
                <div className="mt-4 pt-4 border-t border-border-gray">
                  <p className="text-light-gray text-sm">
                    <strong>Notes:</strong> {appointmentFound.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Reschedule Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Reschedule Appointment</h3>
              
              <div>
                <label className="block text-white font-semibold mb-2">Select New Date & Time</label>
                <Select value={rescheduleDate} onValueChange={setRescheduleDate}>
                  <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                    <SelectValue placeholder="Choose new date and time" />
                  </SelectTrigger>
                  <SelectContent className="bg-medium-gray border-border-gray max-h-60">
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value} className="text-white hover:bg-border-gray">
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleReschedule}
                disabled={!rescheduleDate || rescheduleMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-montserrat font-bold"
              >
                {rescheduleMutation.isPending ? "Rescheduling..." : "Reschedule Appointment"}
              </Button>
            </div>

            {/* Cancel Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-red-400">Cancel Appointment</h3>
              <p className="text-light-gray text-sm">
                Cancelling your appointment will free up the time slot for other customers. 
                This action cannot be undone.
              </p>
              
              <Button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                variant="destructive"
                className="w-full font-montserrat font-bold"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('search');
                  setAppointmentFound(null);
                  setConfirmationCode('');
                  setRescheduleDate('');
                }}
                className="flex-1 border-border-gray text-white hover:bg-medium-gray"
              >
                Back to Search
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}