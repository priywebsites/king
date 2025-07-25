import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scissors, LogOut, Calendar as CalendarIcon, AlertTriangle, Check } from "lucide-react";
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
  const [barberName, setBarberName] = useState("");
  const [awayDays, setAwayDays] = useState<BarberAwayDay[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication on component mount
  useEffect(() => {
    const sessionId = localStorage.getItem("barberSession");
    const storedBarberName = localStorage.getItem("barberName");
    
    if (!sessionId || !storedBarberName) {
      setLocation("/barber-login");
      return;
    }
    
    setBarberName(storedBarberName);
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

  const handleAddAwayDays = async () => {
    if (selectedDates.length === 0) {
      setError("Please select at least one date");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const sessionId = localStorage.getItem("barberSession");
      const dates = selectedDates.map(date => format(date, "yyyy-MM-dd"));
      
      const response = await fetch("/api/barber/away-days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ dates }),
      });

      if (response.ok) {
        setSuccess(`Successfully marked ${dates.length} day(s) as away`);
        setSelectedDates([]);
        setShowConfirmDialog(false);
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

  const handleRemoveAwayDay = async (date: string) => {
    try {
      const sessionId = localStorage.getItem("barberSession");
      const response = await fetch(`/api/barber/away-days/${date}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${sessionId}`,
        },
      });

      if (response.ok) {
        setSuccess("Away day removed successfully");
        await fetchAwayDays();
      }
    } catch (error) {
      setError("Failed to remove away day");
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

  const isDateAway = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return awayDays.some(awayDay => awayDay.awayDate === dateStr);
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
                Welcome, {barberName}
              </h1>
              <p className="text-light-gray">Manage your availability</p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border-gray text-white hover:bg-dark-gray"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

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
                  Select dates when you will be unavailable for appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                  Mark Selected Days as Away
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
                <CardTitle className="text-white">Your Away Days</CardTitle>
                <CardDescription className="text-light-gray">
                  Days when you're not available for appointments
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
                        <span className="text-white">
                          {format(new Date(awayDay.awayDate), "EEEE, MMM dd, yyyy")}
                        </span>
                        <Button
                          onClick={() => handleRemoveAwayDay(awayDay.awayDate)}
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
                Are you sure you want to mark the following days as away? Customers will not be able to book appointments with you on these dates.
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
                onClick={handleAddAwayDays}
                disabled={loading}
                className="bg-white text-black hover:bg-light-gray"
              >
                {loading ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}