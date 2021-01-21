import React from 'react';
import { parseISO, format } from 'date-fns';

interface DateTimeProps {
  ISOString: string;
  formatToken?: string;
}

const DateTime: React.FC<DateTimeProps> = ({
  ISOString,
  formatToken = 'PPpp',
  ...props
}) => {
  const asDate = parseISO(ISOString);
  const formatted = format(asDate, formatToken);

  return <span {...props}>{formatted}</span>;
};

export default DateTime;
