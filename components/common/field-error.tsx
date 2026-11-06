export const FieldError = ({
  id,
  message,
}: {
  id: string;
  message?: string;
}) =>
  message ? (
    <p id={id} className="text-destructive text-xs">
      {message}
    </p>
  ) : null;

/** aria props linking an input to its error message. */
export const errorProps = (id: string, message?: string) => ({
  "aria-invalid": message ? true : undefined,
  "aria-describedby": message ? id : undefined,
});
