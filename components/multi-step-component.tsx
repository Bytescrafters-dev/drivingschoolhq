const StepIndicator = ({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index < currentStep
                ? "bg-green-500 text-white"
                : index === currentStep
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {index + 1}
          </div>
          <div
            className={`ml-2 text-sm ${
              index === currentStep ? "font-medium" : "text-gray-600"
            }`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-px bg-gray-300 mx-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
