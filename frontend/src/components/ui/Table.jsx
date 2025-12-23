const Table = ({ children, className = '' }) => {
  return (
    <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-800 ${className}`}>
      {children}
    </table>
  )
}

const TableHeader = ({ children, className = '' }) => {
  return <thead className={className}>{children}</thead>
}

const TableBody = ({ children, className = '' }) => {
  return <tbody className={className}>{children}</tbody>
}

const TableRow = ({ children, className = '' }) => {
  return <tr className={className}>{children}</tr>
}

const TableCell = ({ children, isHeader = false, className = '' }) => {
  const CellTag = isHeader ? 'th' : 'td'
  const baseClasses = isHeader
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400'
    : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white/90'
  
  return <CellTag className={`${baseClasses} ${className}`}>{children}</CellTag>
}

export { Table, TableHeader, TableBody, TableRow, TableCell }
