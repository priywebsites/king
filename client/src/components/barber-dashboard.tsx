import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar, Scissors, Clock, DollarSign, FileText } from "lucide-react";

interface BarberDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BarberDashboard({ isOpen, onClose }: BarberDashboardProps) {
  const [selectedBarber, setSelectedBarber] = useState<string>("Alex");
  
  const barbers = ["Alex", "Yazan", "Murad", "Moe"];

  const { data: appointments = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/appointments', selectedBarber],
    enabled: isOpen && !!selectedBarber,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const groupedAppointments = (appointments as any[]).reduce((groups: any, appointment: any) => {
    const date = new Date(appointment.appointmentDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-dark-gray rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border-gray"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-montserrat font-bold">🧑‍🔧 Barber Dashboard</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-medium-gray"
              >
                <X size={24} />
              </Button>
            </div>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Select Barber:</label>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger className="bg-medium-gray border-border-gray text-white max-w-xs">
                  <SelectValue placeholder="Select a barber" />
                </SelectTrigger>
                <SelectContent className="bg-medium-gray border-border-gray">
                  {barbers.map((barber) => (
                    <SelectItem key={barber} value={barber} className="text-white hover:bg-border-gray">
                      {barber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-light-gray mt-4">Loading appointments...</p>
              </div>
            ) : (appointments as any[]).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-light-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Appointments</h3>
                <p className="text-light-gray">
                  {selectedBarber} has no confirmed appointments scheduled.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">
                    Upcoming Appointments for {selectedBarber}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="border-border-gray text-white hover:bg-medium-gray"
                  >
                    Refresh
                  </Button>
                </div>

                {sortedDates.map((date) => (
                  <motion.div
                    key={date}
                    className="bg-medium-gray rounded-lg p-6 border border-border-gray"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>

                    <div className="grid gap-4">
                      {groupedAppointments[date]
                        .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                        .map((appointment: any) => (
                          <motion.div
                            key={appointment.id}
                            className="bg-dark-gray rounded-lg p-4 border border-border-gray hover:border-yellow-400/30 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center text-white">
                                  <Clock className="h-4 w-4 mr-2 text-yellow-400" />
                                  <span className="font-semibold">
                                    {(() => {
                                      const startTime = new Date(appointment.appointmentDate);
                                      const endTime = new Date(startTime);
                                      endTime.setMinutes(endTime.getMinutes() + (appointment.totalDuration || 30));
                                      
                                      const startFormatted = startTime.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      });
                                      
                                      const endFormatted = endTime.toLocaleTimeString('en-US', {
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true
                                      });
                                      
                                      return `${startFormatted} - ${endFormatted}`;
                                    })()}
                                  </span>
                                </div>
                                <div className="flex items-center text-light-gray">
                                  <Scissors className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{appointment.serviceType}</span>
                                  {appointment.totalDuration && (
                                    <span className="text-xs text-blue-400 ml-2">({appointment.totalDuration}min)</span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center text-white">
                                  <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                                  <span className="font-semibold">${appointment.totalPrice}</span>
                                </div>
                                <div className="text-sm text-light-gray">
                                  Status: <span className="text-green-400 capitalize">{appointment.status}</span>
                                </div>
                              </div>

                              {appointment.notes && (
                                <div className="space-y-2">
                                  <div className="flex items-start text-light-gray">
                                    <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{appointment.notes}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Privacy Note:</strong> Customer names and phone numbers are not displayed for privacy protection. 
                All customer communication is handled automatically via SMS.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}