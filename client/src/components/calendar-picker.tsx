import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarPickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  maxDaysAdvance?: number;
}

export default function CalendarPicker({ 
  selectedDate, 
  onDateSelect, 
  maxDaysAdvance = 7 
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + maxDaysAdvance);

  const isDateDisabled = (date: Date) => {
    // Allow same day booking - only disable if it's already past today
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    if (dateStart < todayStart) return true;
    
    // Disable if after max advance booking
    if (date > maxDate) return true;
    
    // Disable Tuesdays (2) - barbershop closed on Tuesday, NOT Monday
    if (date.getDay() === 2) return true;
    
    return false;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return formatDateForApi(date) === selectedDate;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const days = getDaysInMonth(currentMonth);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      className="bg-medium-gray rounded-lg p-4 border border-border-gray"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="mr-2" size={20} />
          Select Date
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="text-white hover:bg-border-gray"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-white font-medium min-w-[120px] text-center">
            {monthYear}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="text-white hover:bg-border-gray"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-light-gray p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => !disabled && onDateSelect(formatDateForApi(date))}
              disabled={disabled}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200
                ${disabled 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-white hover:bg-border-gray cursor-pointer'
                }
                ${selected 
                  ? 'bg-yellow-600 text-black font-bold' 
                  : ''
                }
                ${isToday && !selected 
                  ? 'ring-2 ring-yellow-400 ring-opacity-50' 
                  : ''
                }
              `}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              {date.getDate()}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-light-gray">
        <p>• Closed Tuesdays only</p>
        <p>• Same day booking available</p>
        <p>• Book up to {maxDaysAdvance} days in advance</p>
        {selectedDate && (
          <p className="text-yellow-400 font-medium mt-2">
            Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}