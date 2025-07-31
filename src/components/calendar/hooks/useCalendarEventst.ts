import { useState, useEffect, useCallback } from "react";
import { EventInput } from "@fullcalendar/core";

export interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string; // "Tổng trạm" | "Thông tin ngày"
    workType: string; // "chuyên môn" | "chuyên ngành" | "sửa chữa" | "phát triển" | "trực bảo đảm"
    description?: string;
    location?: string;
    responsible?: string;
    materials?: string; // Vật chất trang bị sử dụng
    quantity?: number; // Số lượng hội nghị/đơn vị
    status: 'pending' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    createdBy?: string;
    canEdit?: boolean;
    canDelete?: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export const useCalendarEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [eventWorkType, setEventWorkType] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventResponsible, setEventResponsible] = useState("");
  const [eventMaterials, setEventMaterials] = useState("");
  const [eventQuantity, setEventQuantity] = useState("");
  const [eventStatus, setEventStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [eventPriority, setEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>({
    id: "1",
    name: "Admin User",
    role: "admin" // Có thể thay đổi thành "user" để test
  });

  // Work types for station management
  const workTypes = {
    "chuyên môn": "chuyenMon",
    "chuyên ngành": "chuyenNganh", 
    "sửa chữa máy": "suaChua",
    "phát triển máy": "phatTrien",
    "trực bảo đảm": "trucBaoDam",
  };

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Chờ thực hiện', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
    { value: 'in-progress', label: 'Đang thực hiện', color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' },
    { value: 'completed', label: 'Hoàn thành', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Thấp', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
    { value: 'medium', label: 'Trung bình', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
    { value: 'high', label: 'Cao', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' },
  ];

  // Load initial events
  useEffect(() => {
    const loadInitialEvents = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const initialEvents: CalendarEvent[] = [
          {
            id: "1",
            title: "Bảo trì máy biến áp chính",
            start: new Date().toISOString().split("T")[0],
            end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            allDay: true,
            extendedProps: { 
              calendar: "Tổng trạm",
              workType: "sửa chữa máy",
              description: "Bảo trì định kỳ máy biến áp chính theo lịch",
              location: "Trạm biến áp chính",
              responsible: "Nguyễn Văn A",
              materials: "Dầu biến áp, bộ lọc, dụng cụ bảo trì",
              quantity: 1,
              status: "in-progress",
              priority: "high",
              createdBy: "admin",
              canEdit: true,
              canDelete: true
            },
          },
          {
            id: "2",
            title: "Họp tổng trạm định kỳ",
            start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            allDay: true,
            extendedProps: { 
              calendar: "Thông tin ngày",
              workType: "chuyên môn",
              description: "Họp tổng trạm định kỳ tháng",
              location: "Phòng họp trạm",
              responsible: "Trưởng trạm",
              materials: "Máy chiếu, tài liệu họp",
              quantity: 1,
              status: "pending",
              priority: "medium",
              createdBy: "admin",
              canEdit: true,
              canDelete: true
            },
          },
          {
            id: "3",
            title: "Trực bảo đảm hội nghị",
            start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            allDay: true,
            extendedProps: { 
              calendar: "Thông tin ngày",
              workType: "trực bảo đảm",
              description: "Trực bảo đảm điện cho hội nghị quan trọng",
              location: "Hội trường chính",
              responsible: "Đội trực",
              materials: "Máy phát điện dự phòng, thiết bị đo",
              quantity: 2,
              status: "pending",
              priority: "high",
              createdBy: "user",
              canEdit: true,
              canDelete: false
            },
          },
        ];
        
        setEvents(initialEvents);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialEvents();
  }, []);

  const resetModalFields = useCallback(() => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setEventWorkType("");
    setEventDescription("");
    setEventLocation("");
    setEventResponsible("");
    setEventMaterials("");
    setEventQuantity("");
    setEventStatus('pending');
    setEventPriority('medium');
    setSelectedEvent(null);
  }, []);

  const handleAddOrUpdateEvent = useCallback(async (closeModal: () => void) => {
    if (selectedEvent) {
      // Update existing event - only admin can edit
      if (currentUser.role !== 'admin' && selectedEvent.extendedProps.createdBy !== currentUser.id) {
        console.error("User not authorized to edit this event");
        return;
      }

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { 
                  ...event.extendedProps,
                  calendar: eventLevel,
                  workType: eventWorkType,
                  description: eventDescription,
                  location: eventLocation,
                  responsible: eventResponsible,
                  materials: eventMaterials,
                  quantity: parseInt(eventQuantity) || 0,
                  status: eventStatus,
                  priority: eventPriority
                },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { 
          calendar: eventLevel,
          workType: eventWorkType,
          description: eventDescription,
          location: eventLocation,
          responsible: eventResponsible,
          materials: eventMaterials,
          quantity: parseInt(eventQuantity) || 0,
          status: eventStatus,
          priority: eventPriority,
          createdBy: currentUser.id,
          canEdit: true,
          canDelete: currentUser.role === 'admin'
        },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    
    closeModal();
    resetModalFields();
  }, [selectedEvent, eventTitle, eventStartDate, eventEndDate, eventLevel, eventWorkType, eventDescription, eventLocation, eventResponsible, eventMaterials, eventQuantity, eventStatus, eventPriority, currentUser, resetModalFields]);

  const deleteEvent = useCallback(async (eventId: string) => {
    // Check if user can delete
    const event = events.find(e => e.id === eventId);
    if (!event || (currentUser.role !== 'admin' && event.extendedProps.createdBy !== currentUser.id)) {
      console.error("User not authorized to delete this event");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  }, [events, currentUser]);

  const getEventsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start as string);
      const eventEnd = event.end ? new Date(event.end as string) : eventStart;
      
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }, [events]);

  const getEventsByLevel = useCallback((level: string) => {
    return events.filter(event => event.extendedProps.calendar === level);
  }, [events]);

  const getEventsByWorkType = useCallback((workType: string) => {
    return events.filter(event => event.extendedProps.workType === workType);
  }, [events]);

  const getEventsByStatus = useCallback((status: string) => {
    return events.filter(event => event.extendedProps.status === status);
  }, [events]);

  const getEventsByResponsible = useCallback((responsible: string) => {
    return events.filter(event => event.extendedProps.responsible === responsible);
  }, [events]);

  const getEventsByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return events.filter(event => event.extendedProps.priority === priority);
  }, [events]);

  const getStatistics = useCallback(() => {
    const total = events.length;
    const byStatus = {
      pending: events.filter(e => e.extendedProps.status === 'pending').length,
      'in-progress': events.filter(e => e.extendedProps.status === 'in-progress').length,
      completed: events.filter(e => e.extendedProps.status === 'completed').length,
    };
    const byLevel = {
      'Tổng trạm': events.filter(e => e.extendedProps.calendar === 'Tổng trạm').length,
      'Thông tin ngày': events.filter(e => e.extendedProps.calendar === 'Thông tin ngày').length,
    };
    const byPriority = {
      high: events.filter(e => e.extendedProps.priority === 'high').length,
      medium: events.filter(e => e.extendedProps.priority === 'medium').length,
      low: events.filter(e => e.extendedProps.priority === 'low').length,
    };

    return { total, byStatus, byLevel, byPriority };
  }, [events]);

  return {
    selectedEvent,
    setSelectedEvent,
    eventTitle,
    setEventTitle,
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
    eventLevel,
    setEventLevel,
    eventWorkType,
    setEventWorkType,
    eventDescription,
    setEventDescription,
    eventLocation,
    setEventLocation,
    eventResponsible,
    setEventResponsible,
    eventMaterials,
    setEventMaterials,
    eventQuantity,
    setEventQuantity,
    eventStatus,
    setEventStatus,
    eventPriority,
    setEventPriority,
    events,
    setEvents,
    isLoading,
    currentUser,
    setCurrentUser,
    workTypes,
    statusOptions,
    priorityOptions,
    resetModalFields,
    handleAddOrUpdateEvent,
    deleteEvent,
    getEventsByDateRange,
    getEventsByLevel,
    getEventsByWorkType,
    getEventsByStatus,
    getEventsByResponsible,
    getEventsByPriority,
    getStatistics,
  };
};