"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { CreateEventSchema, CreateEventDTO } from "@/app/dtos/event.dto";
import { useState } from "react";
import { createEvent } from "@/app/actions/events";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Generates "HH:MM" time options every 30 minutes over 24 hours */
function generateTimeSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const period = h < 12 ? "AM" : "PM";
      const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const label = `${hour}:${String(m).padStart(2, "0")} ${period}`;
      slots.push({ value, label });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export default function EventDetailsForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventDTO>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {},
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "availableDatesWithTimes",
  });

  const onSubmit: SubmitHandler<CreateEventDTO> = async (data) => {
    setServerError(null);
    const result = await createEvent(data);
    if (!result.success || !result.data) {
      setServerError(result.error ?? "An unexpected error occurred");
      return;
    }
    router.push(`/create/event/${result.data.id}/success`);
  };

  function sortFieldDates() {
    const current = getValues("availableDatesWithTimes");

    if (!current || current.length === 0) {
      return;
    }

    const sorted = [...current].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    replace(sorted);
  }

  function handleSelectDate(newDates: Date[] | undefined, selectedDate: Date) {
    setSelectedDates(newDates);
    // If date was removed remove, otherwise append
    if (newDates && selectedDates) {
      if (newDates?.length < selectedDates?.length) {
        // Find index of date that was removed
        const indexToRemove = selectedDates.findIndex(
          (date) => date.getTime() === selectedDate.getTime(),
        );
        remove(indexToRemove);
      } else {
        append({
          date: selectedDate,
          startTime: "12:00",
          endTime: "13:00",
        });
      }
    }

    // Order fields
    sortFieldDates();
  }

  function handleApplyAllTimes(sourceIndex: number) {
    const current = getValues("availableDatesWithTimes");

    if (!current || !current[sourceIndex]) {
      return;
    }

    const { startTime, endTime } = current[sourceIndex];

    const updated = current.map((item) => ({
      ...item,
      startTime,
      endTime,
    }));

    replace(updated);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {serverError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md text-sm">
                {serverError}
              </div>
            )}
            <Field>
              <FieldLabel>Event Name</FieldLabel>
              <Input {...register("name")} placeholder="Event Name" />
              {errors.name && <FieldError>{errors.name?.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                {...register("description")}
                rows={4}
                placeholder="This is going to be a cool event!"
              />
              {errors.description && (
                <FieldError>{errors.description?.message}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel>Max People</FieldLabel>
              <Input
                {...register("maxPeople", { valueAsNumber: true })}
                type="number"
                placeholder="Min. 1"
              />
              {errors.maxPeople && (
                <FieldError>{errors.maxPeople?.message}</FieldError>
              )}
            </Field>

            {/* Date and Time Select */}
            <Field>
              <FieldLabel>Select Dates</FieldLabel>
              <div className="flex flex-col gap-6 xl:flex-row md:items-start">
                {/* Calendar */}
                <div className="shrink-0 self-start w-full md:w-auto">
                  <Calendar
                    mode="multiple"
                    required={false}
                    selected={selectedDates}
                    onSelect={handleSelectDate}
                    className="rounded-lg border w-full p-2 sm:p-4 [--cell-size:1.75rem] sm:[--cell-size:2.25rem] md:[--cell-size:2.5rem]"
                  />
                </div>

                {/* Time slots */}
                {fields.length > 0 && (
                  <div className="flex flex-col gap-3 w-full min-w-0">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="rounded-lg border bg-muted/30 px-4 py-3 space-y-3"
                      >
                        {/* Date heading */}
                        <p className="text-sm font-semibold text-foreground">
                          {field.date.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>

                        {/* Time inputs + Apply All */}
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                          <div className="grid grid-cols-2 gap-3 flex-1">
                            <div className="space-y-1.5">
                              <FieldLabel className="text-xs">Start</FieldLabel>
                              <Controller
                                control={control}
                                name={`availableDatesWithTimes.${index}.startTime`}
                                render={({ field }) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Start" />
                                    </SelectTrigger>
                                    <SelectContent
                                      position="popper"
                                      className="max-h-48 overflow-y-auto"
                                    >
                                      {TIME_SLOTS.map((slot) => (
                                        <SelectItem
                                          key={slot.value}
                                          value={slot.value}
                                        >
                                          {slot.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <FieldLabel className="text-xs">End</FieldLabel>
                              <Controller
                                control={control}
                                name={`availableDatesWithTimes.${index}.endTime`}
                                render={({ field }) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="End" />
                                    </SelectTrigger>
                                    <SelectContent
                                      position="popper"
                                      className="max-h-48 overflow-y-auto"
                                    >
                                      {TIME_SLOTS.map((slot) => (
                                        <SelectItem
                                          key={slot.value}
                                          value={slot.value}
                                        >
                                          {slot.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.availableDatesWithTimes?.[index]
                                ?.endTime && (
                                <FieldError>
                                  {
                                    errors.availableDatesWithTimes?.[index]
                                      ?.endTime?.message
                                  }
                                </FieldError>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto shrink-0"
                            onClick={() => handleApplyAllTimes(index)}
                          >
                            Apply All
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>
            <Field>
              <FieldLabel>Pin</FieldLabel>
              <FieldDescription>
                Create a 4 digit pin for your event. This will be used to see
                event info after creation. Don&apos;t forget it!
              </FieldDescription>
              <Input
                {...register("pin")}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="••••"
              />
              {errors.pin && <FieldError>{errors.pin?.message}</FieldError>}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
