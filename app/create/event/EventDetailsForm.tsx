"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { CreateEventSchema, CreateEventDTO } from "@/app/dtos/event.dto";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EventDetailsForm() {
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

  const onSubmit: SubmitHandler<CreateEventDTO> = (data) => {
    setServerError(null);
    console.log("Form Data:", data);
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
        <CardTitle>Your Info</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
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
              <div className="flex items-center md:flex-row h-[400px]">
                <div className="flex-1 min-w-0 md:w-auto">
                  <Calendar
                    mode="multiple"
                    required={false}
                    selected={selectedDates}
                    onSelect={handleSelectDate}
                    className="rounded-lg border shrink-0 p-2 sm:p-4 [--cell-size:1.75rem] sm:[--cell-size:2.25rem] md:[--cell-size:2.5rem]"
                  />
                </div>
                <div className="flex-1 flex flex-col max-h-full overflow-y-scroll gap-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center text-center gap-6 rounded-lg border bg-muted/30 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {field.date.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <FieldLabel className="text-xs">Start</FieldLabel>
                            <Input
                              type="time"
                              className="w-full"
                              {...register(
                                `availableDatesWithTimes.${index}.startTime`,
                              )}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabel className="text-xs">End</FieldLabel>
                            <Input
                              type="time"
                              className="w-full"
                              {...register(
                                `availableDatesWithTimes.${index}.endTime`,
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
                          onClick={() => handleApplyAllTimes(index)}
                        >
                          Apply All
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
