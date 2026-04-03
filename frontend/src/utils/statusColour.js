export const statusColor = (status) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "transformed":
      return "bg-blue-100 text-blue-700";
    case "sent":
      return "bg-yellow-100 text-yellow-700";
    case "overdue":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-purple-100 text-purple-600";
  }
};
