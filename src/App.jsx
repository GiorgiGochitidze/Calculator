import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
import "./App.css";

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      // Handle adding digits to the current operand
      if (state.overwrite) {
        // If overwrite flag is set, replace the current operand with the new digit
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        // If the current operand is "0" and the user tries to add another "0", do nothing
        return state;
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        // If the current operand already contains a decimal point, do nothing
        return state;
      }
      // Concatenate the digit to the current operand
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };

    case ACTIONS.CHOOSE_OPERATION:
      // Handle choosing an operation
      if (state.currentOperand == null && state.previousOperand == null) {
        // If neither current nor previous operand is present, do nothing
        return state;
      }
      if (state.currentOperand == null) {
        // If only the current operand is null, update the operation
        return {
          ...state,
          operation: payload.operation,
        };
      }
      if (state.previousOperand == null) {
        // If only the previous operand is null, update the operation and set the previous operand
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }
      // If both operands are present, evaluate the expression and update the state
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    case ACTIONS.CLEAR:
      // Handle clearing the calculator state
      return {};

    case ACTIONS.DELETE_DIGIT:
      // Handle deleting the last digit from the current operand
      if (state.overwrite) {
        // If overwrite flag is set, clear the current operand
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        // If the current operand has only one digit, set it to null
        return { ...state, currentOperand: null };
      }
      // Remove the last digit from the current operand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case ACTIONS.EVALUATE:
      // Handle evaluating the expression
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        // If any required value is missing, do nothing
        return state;
      }
      // Evaluate the expression, update state, and set overwrite flag to true
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
};

// Function to evaluate the expression based on the given operands and operation
function evaluate({ currentOperand, previousOperand, operation }) {
  // Convert operands to floating-point numbers
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  // Check if either operand is NaN, return an empty string if true
  if (isNaN(prev) || isNaN(current)) return "";

  // Perform computation based on the specified operation
  let computation = "";
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "/":
      computation = prev / current;
      break;
  }

  // Convert the result to a string and return
  return computation.toString();
}

// Number formatter to format integers (maximumFractionDigits set to 0)
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
});

// Function to format the operand for display
function formatOperand(operand) {
  // If the operand is null, return early
  if (operand == null) return;

  // Split the operand into integer and decimal parts
  const [integer, decimal] = operand.split('.');

  // If there is no decimal part, format the integer using the INTEGER_FORMATTER
  if (decimal == null) return INTEGER_FORMATTER.format(integer);

  // If there is a decimal part, format both integer and decimal parts
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  );

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="/" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
        className="span-two"
      >
        =
      </button>
    </div>
  );
}

export default App;
