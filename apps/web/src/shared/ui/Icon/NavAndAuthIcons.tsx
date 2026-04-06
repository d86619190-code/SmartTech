import * as React from "react";

type IconProps = {
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
};

export const IconDashboard: React.FC<IconProps> = ({
  className,
  size = 18,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M4 10.5L12 5l8 5.5V19a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8.5z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconMail: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M4 7h16v10H4V7z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconHistory: React.FC<IconProps> = ({
  className,
  size = 18,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M21 12a9 9 0 10-2.64 6.36L21 21v-8h-8l2.12 2.12"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconLock: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.35" />
    <path
      d="M8 11V8a4 4 0 018 0v3"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    />
  </svg>
);

export const IconMenu: React.FC<IconProps> = ({ className, size = 20, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPhone: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M6.5 4h3l1.5 4.5-2 1.5a12 12 0 006 6l1.5-2L20 15v3a2 2 0 01-2.2 2A16 16 0 014 6.2 2 2 0 016.5 4z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconMapPin: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.35" />
  </svg>
);

export const IconMessage: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M4 6h16v10H8l-4 4V6z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
  </svg>
);

/** Help / FAQ */
export const IconHelp: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.35" />
    <path
      d="M9.5 9.5a2.5 2.5 0 014.8-1 2.5 2.5 0 01-2 2.5c-.7.3-1.3 1-1.3 1.8V13"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    />
    <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
  </svg>
);

export const IconLogin: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Tracking / dashboard */
export const IconTrack: React.FC<IconProps> = ({ className, size = 18, "aria-hidden": ariaHidden = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.35" />
    <path
      d="M12 7v5l3 3"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

export const IconSpark: React.FC<IconProps> = ({
  className,
  size = 18,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden={ariaHidden}
  >
    <path
      d="M13 2L10 14h4l-1 8 7-11h-4l1-9z"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconChevronLeft: React.FC<IconProps> = ({
  className,
  size = 22,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ariaHidden}>
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({
  className,
  size = 22,
  "aria-hidden": ariaHidden = true,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden={ariaHidden}>
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
