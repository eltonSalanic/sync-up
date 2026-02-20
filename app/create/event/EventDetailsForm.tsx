"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, set } from "react-hook-form";
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
import { Field, FieldError, FieldLabel, FieldGroup } from "@/components/ui/field";
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
    formState: { errors, isSubmitting },
  } = useForm<CreateEvent>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
    },
  });

  const onSubmit = async (data: CreateEvent) => {
    setServerError(null);
    console.log("Form Data:", { ...data, selectedDates });
  };

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
              <Input {...register("name")} placeholder="'Event Name'" />
              {errors.name && <FieldError>{errors.name?.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <Textarea {...register("description")} rows={4} placeholder="This is going to be a cool event!" />
              {errors.description && <FieldError>{errors.description?.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Max People</FieldLabel>
              <Input {...register("maxPeople")} type="number" placeholder="Min. 1" />
              {errors.maxPeople && <FieldError>{errors.maxPeople?.message}</FieldError>}
            </Field>
            <Calendar
              mode="multiple"
              required={false}
              selected={selectedDates}
              onSelect={setSelectedDates}
              className="rounded-lg border self-center"
            />
          </FieldGroup>
          {selectedDates?.map((date) => <p key={date.toISOString()}>{date.toISOString()}</p>)}
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type="submit" disabled={isSubmitting} onClick={handleSubmit(onSubmit)}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
