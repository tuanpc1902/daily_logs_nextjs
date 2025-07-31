"use client";
import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import viLocale from "@fullcalendar/core/locales/vi";
import { useCalendarEvents } from "./hooks/useCalendarEventst";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";

const calendarsEvents = {
  "Tổng trạm": "tongTram",
  "Thông tin ngày": "thongTinNgay",
};

const priorityOptions = [
  { value: 'low', label: 'Thấp', color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' },
  { value: 'medium', label: 'Trung bình', color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' },
  { value: 'high', label: 'Cao', color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' },
];

interface FormErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
  level?: string;
  workType?: string;
  responsible?: string;
}

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<any>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sử dụng custom hook
  const {
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
    isLoading: hookLoading,
    currentUser,
    workTypes,
    statusOptions,
    priorityOptions,
    resetModalFields,
    handleAddOrUpdateEvent,
    deleteEvent,
    getStatistics,
  } = useCalendarEvents();

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!eventTitle.trim()) {
      newErrors.title = "Tên công việc là bắt buộc";
    }
    
    if (!eventStartDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    
    if (!eventEndDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    } else if (eventStartDate && new Date(eventEndDate) < new Date(eventStartDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    
    if (!eventLevel) {
      newErrors.level = "Vui lòng chọn loại sự kiện";
    }

    if (!eventWorkType) {
      newErrors.workType = "Vui lòng chọn loại công việc";
    }

    if (!eventResponsible.trim()) {
      newErrors.responsible = "Người phụ trách là bắt buộc";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes with error clearing
  const handleInputChange = (field: string, value: string) => {
    console.log(`Setting ${field} to:`, value); // Debug log
    
    if (field === 'title') setEventTitle(value);
    if (field === 'startDate') setEventStartDate(value);
    if (field === 'endDate') setEventEndDate(value);
    if (field === 'level') {
      console.log('Setting level to:', value);
      setEventLevel(value);
    }
    if (field === 'workType') {
      console.log('Setting workType to:', value);
      setEventWorkType(value);
    }
    if (field === 'description') setEventDescription(value);
    if (field === 'location') setEventLocation(value);
    if (field === 'responsible') setEventResponsible(value);
    if (field === 'materials') setEventMaterials(value);
    if (field === 'quantity') setEventQuantity(value);
    if (field === 'status') {
      console.log('Setting status to:', value);
      setEventStatus(value as 'pending' | 'in-progress' | 'completed');
    }
    if (field === 'priority') {
      console.log('Setting priority to:', value);
      setEventPriority(value as 'low' | 'medium' | 'high');
    }
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setErrors({});
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    
    // Show event details modal
    setSelectedEventForDetails({
      id: event.id,
      title: event.title,
      start: event.start?.toISOString().split("T")[0] || "",
      end: event.end?.toISOString().split("T")[0] || "",
      calendar: event.extendedProps.calendar,
      workType: event.extendedProps.workType,
      description: event.extendedProps.description || "",
      location: event.extendedProps.location || "",
      responsible: event.extendedProps.responsible || "",
      materials: event.extendedProps.materials || "",
      quantity: event.extendedProps.quantity || 0,
      status: event.extendedProps.status || "pending",
      priority: event.extendedProps.priority || "medium",
      canEdit: event.extendedProps.canEdit,
      canDelete: event.extendedProps.canDelete,
      createdBy: event.extendedProps.createdBy,
    });
    setShowEventDetails(true);
  };

  const handleEditEvent = () => {
    if (!selectedEventForDetails) return;
    
    // Check permissions
    if (!selectedEventForDetails.canEdit && currentUser.role !== 'admin') {
      alert("Bạn không có quyền chỉnh sửa sự kiện này");
      return;
    }
    
    setSelectedEvent(selectedEventForDetails);
    setEventTitle(selectedEventForDetails.title);
    setEventStartDate(selectedEventForDetails.start);
    setEventEndDate(selectedEventForDetails.end);
    setEventLevel(selectedEventForDetails.calendar);
    setEventWorkType(selectedEventForDetails.workType);
    setEventDescription(selectedEventForDetails.description);
    setEventLocation(selectedEventForDetails.location);
    setEventResponsible(selectedEventForDetails.responsible);
    setEventMaterials(selectedEventForDetails.materials);
    setEventQuantity(selectedEventForDetails.quantity.toString());
    setEventStatus(selectedEventForDetails.status);
    setEventPriority(selectedEventForDetails.priority);
    setErrors({});
    
    setShowEventDetails(false);
    openModal();
  };

  const handleSubmit = async (closeModal: () => void) => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await handleAddOrUpdateEvent(closeModal);
      
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    // Check permissions
    if (!selectedEvent.extendedProps.canDelete && currentUser.role !== 'admin') {
      alert("Bạn không có quyền xóa sự kiện này");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await deleteEvent(selectedEvent.id as string);
      closeModal();
      resetModalFields();
      
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFromDetails = async () => {
    if (!selectedEventForDetails) return;
    
    // Check permissions
    if (!selectedEventForDetails.canDelete && currentUser.role !== 'admin') {
      alert("Bạn không có quyền xóa sự kiện này");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await deleteEvent(selectedEventForDetails.id);
      setShowEventDetails(false);
      setSelectedEventForDetails(null);
      
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get statistics
  const statistics = getStatistics();

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng công việc</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoàn thành</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.byStatus.completed}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900/20">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đang thực hiện</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.byStatus['in-progress']}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/20">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ưu tiên cao</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{statistics.byPriority.high}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next addEventButton",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            locale={viLocale}
            events={events}
            selectable={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
            dayMaxEvents={true}
            moreLinkClick="popover"
            customButtons={{
              addEventButton: {
                text: "Thêm công việc",
                click: () => {
                  resetModalFields();
                  setErrors({});
                  openModal();
                },
              },
            }}
            buttonText={{
              today: "Hôm nay",
              month: "Tháng",
              week: "Tuần",
              day: "Ngày",
            }}
          />
        </div>

        {/* Event Form Modal */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[800px] max-h-[85vh] mx-4 my-8"
        >
                      <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
              <div className="flex-shrink-0 p-6 lg:p-10 pb-4">
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  {selectedEvent ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedEvent ? "Cập nhật thông tin công việc" : "Nhập thông tin công việc mới"}
                </p>
              </div>
            </div>
            
            {/* Error Message */}
            {Object.keys(errors).length > 0 && (
              <div className="px-6 lg:px-10 pb-4">
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg dark:bg-error-900/20 dark:border-error-800">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-error-700 dark:text-error-300">
                      Vui lòng kiểm tra lại thông tin
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 lg:px-10 space-y-6 pb-4 modal-scrollbar">
              {/* Event Level Selection */}
              <div>
                <Label className="mb-3 block">
                  Loại sự kiện <span className="text-error-500">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div className={`form-check form-check-${value} form-check-inline`}>
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                          htmlFor={`modal${key}`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="event-level"
                            value={key}
                            id={`modal${key}`}
                            checked={eventLevel === key}
                            onChange={() => handleInputChange('level', key)}
                          />
                          <span className={`flex items-center justify-center w-5 h-5 mr-2 border rounded-full transition-colors hover:border-gray-400 ${
                            eventLevel === key 
                              ? "border-brand-500 bg-brand-500" 
                              : "border-gray-300 dark:border-gray-700"
                          }`}>
                            <span
                              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                eventLevel === key ? "bg-white" : "bg-transparent"
                              }`}
                            ></span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.level && (
                  <p className="mt-1 text-xs text-error-500">{errors.level}</p>
                )}
              </div>

              {/* Work Type Selection */}
              <div>
                <Label className="mb-3 block">
                  Loại công việc <span className="text-error-500">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(workTypes).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div className={`form-check form-check-${value} form-check-inline`}>
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                          htmlFor={`workType${key}`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="event-workType"
                            value={key}
                            id={`workType${key}`}
                            checked={eventWorkType === key}
                            onChange={() => handleInputChange('workType', key)}
                          />
                          <span className={`flex items-center justify-center w-5 h-5 mr-2 border rounded-full transition-colors hover:border-gray-400 ${
                            eventWorkType === key 
                              ? "border-brand-500 bg-brand-500" 
                              : "border-gray-300 dark:border-gray-700"
                          }`}>
                            <span
                              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                eventWorkType === key ? "bg-white" : "bg-transparent"
                              }`}
                            ></span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.workType && (
                  <p className="mt-1 text-xs text-error-500">{errors.workType}</p>
                )}
              </div>

              {/* Event Title */}
              <div>
                <Label>
                  Tên công việc <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="event-title"
                  type="text"
                  placeholder="Nhập tên công việc"
                  value={eventTitle}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  hint={errors.title}
                />
              </div>

              {/* Responsible Person */}
              <div>
                <Label>
                  Người phụ trách <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="event-responsible"
                  type="text"
                  placeholder="Nhập tên người phụ trách"
                  value={eventResponsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  error={!!errors.responsible}
                  hint={errors.responsible}
                />
              </div>

              {/* Event Description */}
              <div>
                <Label>
                  Mô tả chi tiết
                </Label>
                <textarea
                  placeholder="Nhập mô tả chi tiết công việc"
                  value={eventDescription}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="h-20 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 resize-none"
                />
              </div>

              {/* Event Location */}
              <div>
                <Label>
                  Địa điểm thực hiện
                </Label>
                <Input
                  id="event-location"
                  type="text"
                  placeholder="Nhập địa điểm thực hiện"
                  value={eventLocation}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              {/* Materials and Quantity */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>
                    Vật chất trang bị sử dụng
                  </Label>
                  <Input
                    id="event-materials"
                    type="text"
                    placeholder="Nhập vật chất trang bị"
                    value={eventMaterials}
                    onChange={(e) => handleInputChange('materials', e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Số lượng hội nghị/đơn vị
                  </Label>
                  <Input
                    id="event-quantity"
                    type="number"
                    placeholder="Nhập số lượng"
                    value={eventQuantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label className="mb-3 block">
                    Trạng thái
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    {statusOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="event-status"
                          value={option.value}
                          checked={eventStatus === option.value}
                          onChange={() => handleInputChange('status', option.value)}
                        />
                                                  <span className={`flex items-center justify-center w-5 h-5 mr-2 border rounded-full transition-colors hover:border-gray-400 ${
                            eventStatus === option.value 
                              ? "border-brand-500 bg-brand-500" 
                              : "border-gray-300 dark:border-gray-700"
                          }`}>
                            <span
                              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                eventStatus === option.value ? "bg-white" : "bg-transparent"
                              }`}
                            ></span>
                          </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">
                    Mức độ ưu tiên
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    {priorityOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                      >
                        <input
                          className="sr-only"
                          type="radio"
                          name="event-priority"
                          value={option.value}
                          checked={eventPriority === option.value}
                          onChange={() => handleInputChange('priority', option.value)}
                        />
                                                  <span className={`flex items-center justify-center w-5 h-5 mr-2 border rounded-full transition-colors hover:border-gray-400 ${
                            eventPriority === option.value 
                              ? "border-brand-500 bg-brand-500" 
                              : "border-gray-300 dark:border-gray-700"
                          }`}>
                            <span
                              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                                eventPriority === option.value ? "bg-white" : "bg-transparent"
                              }`}
                            ></span>
                          </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>
                    Ngày bắt đầu <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="event-start-date"
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={!!errors.startDate}
                    hint={errors.startDate}
                  />
                </div>
                <div>
                  <Label>
                    Ngày kết thúc <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    error={!!errors.endDate}
                    hint={errors.endDate}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-3 p-6 lg:p-10 border-t border-gray-200 dark:border-gray-700 sm:justify-end">
              <Button
                onClick={closeModal}
                variant="outline"
                disabled={isLoading}
              >
                Hủy
              </Button>
              
              {selectedEvent && (
                <Button
                  onClick={handleDeleteEvent}
                  variant="outline"
                  disabled={isLoading}
                  className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900/20"
                  startIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  {isLoading ? "Đang xóa..." : "Xóa"}
                </Button>
              )}
              
              <Button
                onClick={() => handleSubmit(closeModal)}
                disabled={isLoading}
                startIcon={isLoading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              >
                {isLoading ? "Đang lưu..." : selectedEvent ? "Cập nhật" : "Thêm công việc"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Event Details Modal */}
        <Modal
          isOpen={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          className="max-w-[600px] max-h-[85vh] mx-4 my-8"
        >
          {selectedEventForDetails && (
            <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
              <div className="flex-shrink-0 p-6 pb-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-gray-800 dark:text-white/90 text-lg">
                    Chi tiết công việc
                  </h5>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusOptions.find(s => s.value === selectedEventForDetails.status)?.color
                    }`}>
                      {statusOptions.find(s => s.value === selectedEventForDetails.status)?.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      priorityOptions.find(p => p.value === selectedEventForDetails.priority)?.color
                    }`}>
                      {priorityOptions.find(p => p.value === selectedEventForDetails.priority)?.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4 modal-scrollbar">
                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tên công việc
                  </Label>
                  <p className="text-gray-800 dark:text-white/90 font-medium">
                    {selectedEventForDetails.title}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Loại sự kiện
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.calendar}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Loại công việc
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.workType}
                    </p>
                  </div>
                </div>
                
                {selectedEventForDetails.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mô tả
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.description}
                    </p>
                  </div>
                )}
                
                {selectedEventForDetails.location && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Địa điểm
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.location}
                    </p>
                  </div>
                )}
                
                {selectedEventForDetails.responsible && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Người phụ trách
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.responsible}
                    </p>
                  </div>
                )}
                
                {selectedEventForDetails.materials && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Vật chất trang bị
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.materials}
                    </p>
                  </div>
                )}
                
                {selectedEventForDetails.quantity && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Số lượng
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedEventForDetails.quantity}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ngày bắt đầu
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {new Date(selectedEventForDetails.start).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ngày kết thúc
                    </Label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {new Date(selectedEventForDetails.end).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex items-center gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setShowEventDetails(false)}
                  variant="outline"
                  size="sm"
                >
                  Đóng
                </Button>
                
                {selectedEventForDetails.canDelete && (
                  <Button
                    onClick={handleDeleteFromDetails}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="text-error-600 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-700 dark:hover:bg-error-900/20"
                    startIcon={
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                  >
                    {isLoading ? "Đang xóa..." : "Xóa"}
                  </Button>
                )}
                
                {selectedEventForDetails.canEdit && (
                  <Button
                    onClick={handleEditEvent}
                    size="sm"
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar?.toLowerCase?.()}`;
  const priority = eventInfo.event.extendedProps.priority || 'medium';
  const status = eventInfo.event.extendedProps.status || 'pending';
  const priorityColor = priority === 'high' ? 'border-l-red-500' : 
                       priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500';
  const statusColor = status === 'completed' ? 'border-r-green-500' :
                     status === 'in-progress' ? 'border-r-blue-500' : 'border-r-yellow-500';
  
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm hover:opacity-90 transition-opacity cursor-pointer border-l-4 border-r-4 ${priorityColor} ${statusColor}`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time text-xs">{eventInfo.timeText}</div>
      <div className="fc-event-title text-sm font-medium">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;