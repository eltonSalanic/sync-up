"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { AnonUserSchema, CreateAnonUser } from "@/app/dtos/user.dto";
import { Timezones } from "@/app/types/enums";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
import { createAnonUser } from "@/app/actions/users";

export default function AnonUserForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAnonUser>({
    resolver: zodResolver(AnonUserSchema),
    defaultValues: {
      fName: "",
      lName: "",
      timezone: Timezones[0],
    },
  });

  const onSubmit = async (data: CreateAnonUser) => {
    setServerError(null);

    const result = await createAnonUser(data);

    if (!result.success) {
      setServerError(result.error ?? "An error occurred");
      return;
    }
    
    router.push("/create/event");
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
                      {Timezones.map((timezone) => {
                        return (
                          <SelectItem key={timezone} value={timezone}>
                            {
                              timezone
                                .split("_")
                                .join(" ") /* Removes underscores */
                            }
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
