import AnonUserForm from "./AnonUserForm";

export default function CreateAnonUserPage() {
  return (
    <div className="w-full">
      <p>
        Start by adding your name and timezone. You will be the host of the
        event.
      </p>
      <AnonUserForm />
    </div>
  );
}
