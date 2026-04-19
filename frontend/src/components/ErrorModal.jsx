function ErrorModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center border border-transparent dark:border-gray-700 transition-colors duration-300">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-500 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center mb-6">
          {message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full py-2 hover:opacity-90 transition-opacity"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ErrorModal;