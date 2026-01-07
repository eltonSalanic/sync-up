"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Constants } from "@/database.types";

import { Button } from "@/components/ui/button";
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

const timezoneOptions = Constants.public.Enums.tz;

const schema = z.object({
  fName: z.string().min(1, "First name is required"),
  lName: z.string().min(1, "Last name is required"),
  timezone: z.enum(timezoneOptions, "Some error message"),
});

type FormFields = z.infer<typeof schema>;

export default function AnonUserForm() {
  //formState: {errors, isSubmitting}
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      fName: "",
      lName: "",
      timezone: "" as any,
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Info</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel>First Name</FieldLabel>
              <Input {...register("fName")} placeholder="John" />
              {errors.fName && <FieldError>{errors.fName?.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel>Last Name</FieldLabel>
              <Input {...register("lName")} placeholder="Doe" />
              {errors.lName && <FieldError>{errors.lName?.message}</FieldError>}
            </Field>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Timezone</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezoneOptions.map((timezone) => {
                        return (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone.split("_").join(" ")}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <FieldError>{errors.timezone.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button type="submit" onClick={handleSubmit((data) => {
              console.log(data);
            })}>Submit</Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
