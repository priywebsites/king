import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DatePicker({ 
  selectedDate, 
  onDateSelect, 
  minDate, 
  maxDate 
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    // Disable Tuesdays (2) - barbershop closed on Tuesday
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <motion.div
      className="bg-medium-gray rounded-xl border border-border-gray p-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="text-white hover:bg-border-gray"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <h3 className="text-lg font-semibold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="text-white hover:bg-border-gray"
        >
          <ChevronRight size={20} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-light-gray p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2" />;
          }

          const isSelected = selectedDate === formatDateForApi(day);
          const isDisabled = isDateDisabled(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <motion.button
              key={day.getTime()}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200
                ${isSelected 
                  ? 'bg-yellow-400 text-black font-bold' 
                  : isDisabled 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : isToday
                      ? 'bg-border-gray text-white font-semibold ring-2 ring-yellow-400'
                      : 'text-white hover:bg-border-gray'
                }
              `}
              onClick={() => !isDisabled && onDateSelect(formatDateForApi(day))}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
            >
              {day.getDate()}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-light-gray">
        <p>• Closed Tuesdays only</p>
        {selectedDate && (
          <p className="text-yellow-400 font-medium mt-2">
            Selected: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}