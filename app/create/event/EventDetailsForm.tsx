"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  Controller,
  set,
  useFieldArray,
  useController,
} from "react-hook-form";
import { CreateEventSchema, CreateEvent } from "@/app/dtos/event.dto";
import { useState } from "react";

import { Timezones } from "@/app/types/enums";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  } = useForm<CreateEvent>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {},
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "availableDatesWithTimes",
  });

  const onSubmit = async (data: CreateEvent) => {
    setServerError(null);
    console.log("Form Data:", { ...data, selectedDates });
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
                {...register("maxPeople")}
                type="number"
                placeholder="Min. 1"
              />
              {errors.maxPeople && (
                <FieldError>{errors.maxPeople?.message}</FieldError>
              )}
            </Field>
            <div className="flex gap-2">
              <Calendar
                mode="multiple"
                required={false}
                selected={selectedDates}
                onSelect={handleSelectDate}
                className="rounded-lg border self-center"
              />
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => {
                  return (
                    <div key={field.id}>
                      <h5>{field.date.toLocaleDateString()}</h5>
                      <FieldLabel>Start Time</FieldLabel>
                      <Input
                        type="time"
                        {...register(
                          `availableDatesWithTimes.${index}.startTime`,
                        )}
                      />
                      <FieldLabel>End Time</FieldLabel>
                      <Input
                        type="time"
                        {...register(
                          `availableDatesWithTimes.${index}.endTime`,
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
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
