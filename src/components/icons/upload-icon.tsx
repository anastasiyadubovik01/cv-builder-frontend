type UploadIconProps = {
  className?: string;
};

export function UploadIcon({ className }: UploadIconProps) {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 35 35"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M26.2499 21.8749V26.2499H8.74992V21.8749H5.83325V26.2499C5.83325 27.8541 7.14575 29.1666 8.74992 29.1666H26.2499C27.8541 29.1666 29.1666 27.8541 29.1666 26.2499V21.8749H26.2499ZM10.2083 13.1249L12.2645 15.1812L16.0416 11.4187V23.3333H18.9583V11.4187L22.7353 15.1812L24.7916 13.1249L17.4999 5.83325L10.2083 13.1249Z"
        fill="currentColor"
      />
    </svg>
  );
}
