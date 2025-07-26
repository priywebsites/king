import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Scissors, LogOut, Calendar as CalendarIcon, AlertTriangle, Check, Phone, Shield, UserPlus, Clock, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface BarberAwayDay {
  id: number;
  barberName: string;
  awayDate: string;
  createdAt: string;
}

export default function BarberPanel() {
  const [, setLocation] = useLocation();
  const [awayDays, setAwayDays] = useState<BarberAwayDay[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("Alex");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [showRemoveSmsDialog, setShowRemoveSmsDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [removeSmsCode, setRemoveSmsCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [removeCodeSent, setRemoveCodeSent] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{barberName: string, date: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Manager dashboard states
  const [activeTab, setActiveTab] = useState("awayDays");
  const [managerBarber, setManagerBarber] = useState("Alex");
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  // Walk-in booking states
  const [showWalkInDialog, setShowWalkInDialog] = useState(false);
  const [walkInBarber, setWalkInBarber] = useState("");
  const [walkInServices, setWalkInServices] = useState<string[]>([]);
  const [walkInDate, setWalkInDate] = useState("");
  const [walkInTimeSlot, setWalkInTimeSlot] = useState("");
  const [walkInTotalPrice, setWalkInTotalPrice] = useState(0);
  const [walkInTotalDuration, setWalkInTotalDuration] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<{value: string, label: string}[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [walkInSmsCode, setWalkInSmsCode] = useState("");
  const [walkInCodeSent, setWalkInCodeSent] = useState(false);

  const barbers = ["Alex", "Yazan", "Murad", "Moe"];

  // Fetch today's appointments for manager view
  const fetchTodayAppointments = async (barber: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/appointments/${barber}?date=${today}`);
      if (response.ok) {
        const appointments = await response.json();
        setTodayAppointments(appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setTodayAppointments([]);
    }
  };

  useEffect(() => {
    if (activeTab === "manager") {
      fetchTodayAppointments(managerBarber);
    }
  }, [activeTab, managerBarber]);

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

  // Check authentication on component mount
  useEffect(() => {
    const sessionId = localStorage.getItem("barberSession");
    
    if (!sessionId) {
      setLocation("/barber-login");
      return;
    }
    
    fetchAwayDays();
  }, [setLocation]);

  const fetchAwayDays = async () => {
    try {
      const sessionId = localStorage.getItem("barberSession");
      const response = await fetch("/api/barber/away-days", {
        headers: {
          "Authorization": `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAwayDays(data);
      }
    } catch (error) {
      console.error("Failed to fetch away days:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("barberSession");
      await fetch("/api/barber/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionId}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("barberSession");
      localStorage.removeItem("barberName");
      setLocation("/barber-login");
    }
  };

  const handleSendSmsCode = async () => {
    setSmsLoading(true);
    setError("");

    try {
      const sessionId = localStorage.getItem("barberSession");
      const response = await fetch("/api/barber/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ barberName: selectedBarber }),
      });

      if (response.ok) {
        const data = await response.json();
        setPhoneNumber(data.phoneNumber); // Set the phone number from response
        setCodeSent(true);
        setSuccess(`Verification code sent to ${selectedBarber}'s phone`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerifyAndAddAwayDays = async () => {
    if (!smsCode) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionId = localStorage.getItem("barberSession");
      const dates = selectedDates.map(date => format(date, "yyyy-MM-dd"));
      
      const response = await fetch("/api/barber/verify-and-add-away-days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ 
          code: smsCode, 
          dates, 
          barberName: selectedBarber 
        }),
      });

      if (response.ok) {
        setSuccess(`Successfully marked ${dates.length} day(s) as away for ${selectedBarber}`);
        setSelectedDates([]);
        setShowConfirmDialog(false);
        setShowSmsDialog(false);
        setPhoneNumber("");
        setSmsCode("");
        setCodeSent(false);
        await fetchAwayDays();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add away days");
      }
    } catch (error) {
      setError("Failed to add away days. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateRemove = (barberName: string, date: string) => {
    setRemoveTarget({ barberName, date });
    setShowRemoveSmsDialog(true);
  };

  const handleSendRemoveSmsCode = async () => {
    if (!removeTarget) return;

    setSmsLoading(true);
    setError("");

    try {
      const sessionId = localStorage.getItem("barberSession");
      const response = await fetch("/api/barber/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ barberName: removeTarget.barberName }),
      });

      if (response.ok) {
        const data = await response.json();
        setPhoneNumber(data.phoneNumber);
        setRemoveCodeSent(true);
        setSuccess(`Verification code sent to ${removeTarget.barberName}'s phone`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerifyAndRemoveAwayDay = async () => {
    if (!removeSmsCode || !removeTarget) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionId = localStorage.getItem("barberSession");
      
      const response = await fetch("/api/barber/verify-and-remove-away-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ 
          code: removeSmsCode, 
          barberName: removeTarget.barberName,
          date: removeTarget.date
        }),
      });

      if (response.ok) {
        setSuccess(`Successfully removed away day for ${removeTarget.barberName}`);
        setShowRemoveSmsDialog(false);
        setRemoveTarget(null);
        setRemoveSmsCode("");
        setRemoveCodeSent(false);
        setPhoneNumber("");
        await fetchAwayDays();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to remove away day");
      }
    } catch (error) {
      setError("Failed to remove away day. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateExists = selectedDates.some(d => d.toDateString() === date.toDateString());
    if (dateExists) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  // Walk-in booking functions
  const calculateWalkInTotals = (serviceNames: string[], barber: string) => {
    let totalPrice = 0;
    let totalDuration = 0;
    
    serviceNames.forEach(serviceName => {
      const service = services.find(s => s.name === serviceName);
      if (service) {
        totalPrice += service.price;
        totalDuration += service.duration;
      }
    });
    
    const alexSurcharge = barber === "Alex" ? 5 : 0;
    return { totalPrice: totalPrice + alexSurcharge, totalDuration };
  };

  const fetchAvailableSlots = async (barber: string, date: string, duration: number) => {
    if (!barber || !date || !duration) return;
    
    setSlotsLoading(true);
    try {
      const response = await fetch(`/api/available-slots/${encodeURIComponent(barber)}/${date}/${duration}`);
      if (response.ok) {
        const slots = await response.json();
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleWalkInServiceChange = (serviceName: string, checked: boolean) => {
    let newServices;
    if (checked) {
      newServices = [...walkInServices, serviceName];
    } else {
      newServices = walkInServices.filter(s => s !== serviceName);
    }
    setWalkInServices(newServices);
    
    if (walkInBarber && newServices.length > 0) {
      const { totalPrice, totalDuration } = calculateWalkInTotals(newServices, walkInBarber);
      setWalkInTotalPrice(totalPrice);
      setWalkInTotalDuration(totalDuration);
      
      if (walkInDate) {
        const actualDate = walkInDate === "today" ? new Date().toISOString().split('T')[0] : walkInDate;
        fetchAvailableSlots(walkInBarber, actualDate, totalDuration);
      }
    }
  };

  const handleWalkInBarberChange = (barber: string) => {
    setWalkInBarber(barber);
    if (walkInServices.length > 0) {
      const { totalPrice, totalDuration } = calculateWalkInTotals(walkInServices, barber);
      setWalkInTotalPrice(totalPrice);
      setWalkInTotalDuration(totalDuration);
      
      if (walkInDate) {
        const actualDate = walkInDate === "today" ? new Date().toISOString().split('T')[0] : walkInDate;
        fetchAvailableSlots(barber, actualDate, totalDuration);
      }
    }
  };

  const handleWalkInDateChange = (date: string) => {
    setWalkInDate(date);
    setWalkInTimeSlot("");
    setAvailableSlots([]);
    if (walkInBarber && walkInTotalDuration > 0) {
      // For "today", use today's date in YYYY-MM-DD format
      const actualDate = date === "today" ? new Date().toISOString().split('T')[0] : date;
      fetchAvailableSlots(walkInBarber, actualDate, walkInTotalDuration);
    }
  };

  const handleSendWalkInCode = async () => {
    if (!walkInBarber) return;
    
    setSmsLoading(true);
    setError("");
    
    try {
      const sessionId = localStorage.getItem("barberSession");
      const response = await fetch("/api/barber/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ barberName: walkInBarber }),
      });

      if (response.ok) {
        setWalkInCodeSent(true);
        setSuccess(`Verification code sent to ${walkInBarber}'s phone`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleBookWalkIn = async () => {
    if (!walkInSmsCode || !walkInBarber || !walkInTimeSlot) {
      setError("Please complete all fields and enter verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const sessionId = localStorage.getItem("barberSession");
      
      // Use the selected time slot for all bookings (including today)
      const appointmentDateTime = walkInTimeSlot;
      
      const response = await fetch("/api/barber/book-walkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          barber: walkInBarber,
          services: walkInServices,
          appointmentDate: appointmentDateTime,
          totalDuration: walkInTotalDuration,
          totalPrice: walkInTotalPrice,
          code: walkInSmsCode
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Walk-in appointment booked successfully for ${walkInBarber}`);
        
        // Reset form
        setShowWalkInDialog(false);
        setWalkInBarber("");
        setWalkInServices([]);
        setWalkInDate("");
        setWalkInTimeSlot("");
        setWalkInSmsCode("");
        setWalkInCodeSent(false);
        setWalkInTotalPrice(0);
        setWalkInTotalDuration(0);
        setAvailableSlots([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to book walk-in appointment");
      }
    } catch (error) {
      setError("Failed to book walk-in appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDateAway = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return awayDays.some(awayDay => awayDay.awayDate === dateStr && awayDay.barberName === selectedBarber);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-light-gray rounded-full flex items-center justify-center">
              <Scissors className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-montserrat font-bold text-white">
                Store Staff Panel
              </h1>
              <p className="text-light-gray">Manage barber availability</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowWalkInDialog(true)} 
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Walk-In Booking
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border-gray text-white hover:bg-dark-gray"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === "awayDays" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-dark-gray border-border-gray">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Mark Away Days
                </CardTitle>
                <CardDescription className="text-light-gray">
                  Select dates when the chosen barber will be unavailable for appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="text-sm font-medium text-white">Select Barber</label>
                  <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                    <SelectTrigger className="bg-medium-gray border-border-gray text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-medium-gray border-border-gray">
                      {barbers.map(barber => (
                        <SelectItem key={barber} value={barber}>{barber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border border-border-gray bg-medium-gray text-white"
                  disabled={(date) => date < new Date() || isDateAway(date)}
                  modifiers={{
                    selected: selectedDates,
                    away: (date) => isDateAway(date)
                  }}
                  modifiersStyles={{
                    selected: { backgroundColor: "#ffffff", color: "#000000" },
                    away: { backgroundColor: "#ef4444", color: "#ffffff" }
                  }}
                />
                
                {selectedDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-light-gray mb-2">
                      Selected dates ({selectedDates.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="secondary" className="bg-white text-black">
                          {format(date, "MMM dd, yyyy")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={selectedDates.length === 0}
                  className="w-full mt-4 bg-white text-black hover:bg-light-gray"
                >
                  Mark {selectedBarber} as Away
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Away Days List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-dark-gray border-border-gray">
              <CardHeader>
                <CardTitle className="text-white">All Barbers' Away Days</CardTitle>
                <CardDescription className="text-light-gray">
                  Days when barbers are not available for appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {awayDays.length === 0 ? (
                  <p className="text-light-gray text-center py-8">
                    No away days scheduled
                  </p>
                ) : (
                  <div className="space-y-2">
                    {awayDays.map((awayDay) => (
                      <div
                        key={awayDay.id}
                        className="flex items-center justify-between p-3 bg-medium-gray rounded-lg"
                      >
                        <div className="text-white">
                          <span className="font-medium">{awayDay.barberName}</span>
                          <span className="mx-2">•</span>
                          <span>{format(new Date(awayDay.awayDate + 'T12:00:00'), "EEEE, MMM dd, yyyy")}</span>
                        </div>
                        <Button
                          onClick={() => handleInitiateRemove(awayDay.barberName, awayDay.awayDate)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          </div>
        )}

        {/* Manager Dashboard Tab */}
        {activeTab === "manager" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-dark-gray border-border-gray">
              <CardHeader>
                <CardTitle className="text-white">Today's Appointments - Manager View</CardTitle>
                <CardDescription className="text-light-gray">
                  View all bookings for each barber today
                </CardDescription>
                <div className="mt-4">
                  <Select value={managerBarber} onValueChange={(value) => {
                    setManagerBarber(value);
                    fetchTodayAppointments(value);
                  }}>
                    <SelectTrigger className="bg-medium-gray border-border-gray text-white max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-medium-gray border-border-gray">
                      {barbers.map(barber => (
                        <SelectItem key={barber} value={barber}>{barber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <p className="text-light-gray text-center py-8">
                    No appointments for {managerBarber} today
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((appointment, index) => {
                      const startTime = new Date(appointment.appointmentDate);
                      const endTime = new Date(startTime);
                      endTime.setMinutes(endTime.getMinutes() + (appointment.totalDuration || 30));
                      
                      return (
                        <div key={appointment.id} className="bg-medium-gray p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">
                              {startTime.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true
                              })} - {endTime.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit', 
                                hour12: true
                              })}
                            </span>
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              {appointment.totalDuration || 30}min
                            </Badge>
                          </div>
                          <div className="text-light-gray text-sm">
                            <p className="font-medium text-white">{appointment.serviceType}</p>
                            <p>Customer: {appointment.customerName}</p>
                            <p>Total: ${appointment.totalPrice}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Alert className="border-red-500 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Alert className="border-green-500 bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-dark-gray border-border-gray text-white">
            <DialogHeader>
              <DialogTitle>Confirm Away Days</DialogTitle>
              <DialogDescription className="text-light-gray">
                Are you sure you want to mark the following days as away for {selectedBarber}? This will require SMS verification.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex flex-wrap gap-2">
                {selectedDates.map((date, index) => (
                  <Badge key={index} variant="secondary" className="bg-white text-black">
                    {format(date, "MMM dd, yyyy")}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowConfirmDialog(false)}
                className="text-light-gray hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setShowSmsDialog(true);
                }}
                className="bg-white text-black hover:bg-light-gray"
              >
                Continue with SMS Verification
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SMS Verification Dialog */}
        <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
          <DialogContent className="bg-dark-gray border-border-gray text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                SMS Verification Required
              </DialogTitle>
              <DialogDescription className="text-light-gray">
                For security, we need to verify your identity before marking away days.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!codeSent ? (
                <div className="space-y-2">
                  <p className="text-sm text-light-gray">
                    SMS verification code will be sent to {selectedBarber}'s registered phone number.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Verification Code</label>
                  <Input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="bg-medium-gray border-border-gray text-white placeholder-light-gray"
                    maxLength={6}
                  />
                  <p className="text-xs text-light-gray">
                    Code sent to {selectedBarber}'s phone: {phoneNumber}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSmsDialog(false);
                  setCodeSent(false);
                  setPhoneNumber("");
                  setSmsCode("");
                }}
                className="text-light-gray hover:text-white"
              >
                Cancel
              </Button>
              
              {!codeSent ? (
                <Button
                  onClick={handleSendSmsCode}
                  disabled={smsLoading}
                  className="bg-white text-black hover:bg-light-gray"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {smsLoading ? "Sending..." : `Send Code to ${selectedBarber}`}
                </Button>
              ) : (
                <Button
                  onClick={handleVerifyAndAddAwayDays}
                  disabled={loading || !smsCode}
                  className="bg-white text-black hover:bg-light-gray"
                >
                  {loading ? "Verifying..." : "Verify & Confirm"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove SMS Verification Dialog */}
        <Dialog open={showRemoveSmsDialog} onOpenChange={(open) => {
          setShowRemoveSmsDialog(open);
          if (!open) {
            setRemoveTarget(null);
            setRemoveSmsCode("");
            setRemoveCodeSent(false);
            setPhoneNumber("");
          }
        }}>
          <DialogContent className="bg-dark-gray border-border-gray text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                SMS Verification Required
              </DialogTitle>
              <DialogDescription className="text-light-gray">
                {removeTarget && `Verify to remove away day for ${removeTarget.barberName} on ${format(new Date(removeTarget.date + 'T12:00:00'), "EEEE, MMM dd, yyyy")}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!removeCodeSent ? (
                <div className="space-y-2">
                  <p className="text-sm text-light-gray">
                    SMS verification code will be sent to {removeTarget?.barberName}'s registered phone number.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Verification Code</label>
                  <Input
                    type="text"
                    value={removeSmsCode}
                    onChange={(e) => setRemoveSmsCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="bg-medium-gray border-border-gray text-white placeholder-light-gray"
                    maxLength={6}
                  />
                  <p className="text-xs text-light-gray">
                    Code sent to {removeTarget?.barberName}'s phone: {phoneNumber}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRemoveSmsDialog(false);
                  setRemoveTarget(null);
                  setRemoveSmsCode("");
                  setRemoveCodeSent(false);
                  setPhoneNumber("");
                }}
                className="text-light-gray hover:text-white"
              >
                Cancel
              </Button>
              
              {!removeCodeSent ? (
                <Button
                  onClick={handleSendRemoveSmsCode}
                  disabled={smsLoading}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {smsLoading ? "Sending..." : `Send Code to ${removeTarget?.barberName}`}
                </Button>
              ) : (
                <Button
                  onClick={handleVerifyAndRemoveAwayDay}
                  disabled={loading || !removeSmsCode}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  {loading ? "Verifying..." : "Verify & Remove"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Walk-In Booking Dialog */}
        <Dialog open={showWalkInDialog} onOpenChange={(open) => {
          setShowWalkInDialog(open);
          if (!open) {
            setWalkInBarber("");
            setWalkInServices([]);
            setWalkInDate("");
            setWalkInTimeSlot("");
            setWalkInSmsCode("");
            setWalkInCodeSent(false);
            setWalkInTotalPrice(0);
            setWalkInTotalDuration(0);
            setAvailableSlots([]);
          }
        }}>
          <DialogContent className="bg-dark-gray border-border-gray text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Walk-In Booking
              </DialogTitle>
              <DialogDescription className="text-light-gray">
                Book a walk-in customer directly for any barber
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Barber Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select Barber *</label>
                <Select value={walkInBarber} onValueChange={handleWalkInBarberChange}>
                  <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                    <SelectValue placeholder="Choose barber" />
                  </SelectTrigger>
                  <SelectContent className="bg-medium-gray border-border-gray">
                    {barbers.map(barber => (
                      <SelectItem key={barber} value={barber}>{barber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Services Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Select Services *</label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {services.map((service) => (
                    <label key={service.name} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={walkInServices.includes(service.name)}
                        onChange={(e) => handleWalkInServiceChange(service.name, e.target.checked)}
                        className="rounded border-border-gray"
                      />
                      <div className="flex-1">
                        <span className="text-white">{service.name}</span>
                        <div className="text-light-gray text-xs">
                          ${service.price} • {service.duration}min
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {walkInServices.length > 0 && (
                  <div className="bg-medium-gray p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-light-gray">Total Duration:</span>
                      <span className="text-white font-medium">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {walkInTotalDuration} minutes
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-light-gray">Total Price:</span>
                      <span className="text-white font-medium">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        ${walkInTotalPrice}
                        {walkInBarber === "Alex" && <span className="text-green-400 text-xs ml-1">(+$5 Alex premium)</span>}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Select Date *</label>
                <Select value={walkInDate} onValueChange={handleWalkInDateChange}>
                  <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                    <SelectValue placeholder="Choose date" />
                  </SelectTrigger>
                  <SelectContent className="bg-medium-gray border-border-gray">
                    <SelectItem value="today">Today</SelectItem>
                    {Array.from({length: 7}, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i + 1);
                      const dateStr = date.toISOString().split('T')[0];
                      const displayStr = date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                      return (
                        <SelectItem key={dateStr} value={dateStr}>
                          {displayStr}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slot Selection */}
              {walkInDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Select Time Slot *</label>
                  {slotsLoading ? (
                    <p className="text-light-gray">Loading available slots...</p>
                  ) : availableSlots.length > 0 ? (
                    <Select value={walkInTimeSlot} onValueChange={setWalkInTimeSlot}>
                      <SelectTrigger className="bg-medium-gray border-border-gray text-white">
                        <SelectValue placeholder="Choose time slot" />
                      </SelectTrigger>
                      <SelectContent className="bg-medium-gray border-border-gray">
                        {availableSlots.map(slot => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-red-400 text-sm">
                      <p>No available slots for this date.</p>
                      <p className="text-xs text-light-gray mt-1">
                        {walkInBarber} may be away or fully booked on this date.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SMS Verification */}
              <div className="space-y-3 border-t border-border-gray pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">SMS Verification Required</span>
                  {!walkInCodeSent ? (
                    <Button
                      onClick={handleSendWalkInCode}
                      disabled={!walkInBarber || smsLoading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {smsLoading ? "Sending..." : "Send Code"}
                    </Button>
                  ) : (
                    <span className="text-green-400 text-sm">✓ Code Sent</span>
                  )}
                </div>
                
                {walkInCodeSent && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      value={walkInSmsCode}
                      onChange={(e) => setWalkInSmsCode(e.target.value)}
                      placeholder="Enter 6-digit verification code"
                      className="bg-medium-gray border-border-gray text-white placeholder-light-gray"
                      maxLength={6}
                    />
                    <p className="text-xs text-light-gray">
                      Code sent to {walkInBarber}'s phone: +1 431-997-3415
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowWalkInDialog(false)}
                className="text-light-gray hover:text-white"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleBookWalkIn}
                disabled={loading || !walkInBarber || walkInServices.length === 0 || 
                         !walkInTimeSlot || !walkInSmsCode}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Booking..." : "Book Walk-In"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}