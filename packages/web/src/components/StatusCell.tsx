import { getStatusClass } from '../utils/statusUtils';

interface StatusCellProps {
  status: string;
}

export function StatusCell({ status }: StatusCellProps) {
  const statusClass = status !== '-' ? getStatusClass(status) : '';
  return <td className={statusClass}>{status}</td>;
}
