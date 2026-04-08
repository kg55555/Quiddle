/**
 * CopyButton Component
 * 
 * A reusable button component that copies text to the clipboard when clicked.
 * Displays a copy icon that changes to a check mark when the text is successfully copied.
 * The button provides visual feedback and accessibility features including:
 * - Dynamic icon that changes on successful copy
 * - Tooltip that updates based on copy state
 * - Screen reader text for accessibility
 * - Full keyboard and focus support
 * 
 * @component
 * @example
 * // Basic usage
 * <CopyButton text="npm install my-package" />
 * 
 * @example
 * // With custom styling
 * <CopyButton text="npm install my-package" className="custom-class" />
 * 
 * @typedef {Object} Props
 * @property {string} text - The text to copy to clipboard when button is clicked (required)
 * @property {...ComponentProps<"div">} rest - Standard HTML div element props (className, id, data-*, etc.)
 *                                              Note: className, onClick, and title are managed internally
 * 
 * @returns {JSX.Element} A clickable div button with copy functionality, dynamic icon, and accessibility features
 */
import { ComponentProps, forwardRef, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

/**
 * Props interface for CopyButton component
 * 
 * Extends standard div element props while removing className, onClick, and title
 * as these are managed internally by the component.
 * 
 * @interface Props
 * @property {string} text - The text content to be copied to clipboard
 * @property {...rest} - Remaining HTML div attributes (id, data-*, aria-*, etc.)
 */
interface Props
  extends Omit<ComponentProps<"div">, "className" | "onClick" | "title"> {
  text: string;
}

/**
 * CopyButton - A button component that copies text to the clipboard
 * 
 * Features:
 * - Uses navigator.clipboard API to copy text
 * - Displays DocumentDuplicateIcon by default, switches to CheckCircleIcon on successful copy
 * - Automatically resets to copy icon state after component updates
 * - Accessible with proper ARIA attributes and screen reader support
 * - Responsive design that adapts from mobile to desktop
 * - Keyboard accessible (can be focused and activated)
 * - Visual feedback with hover and focus states
 * 
 * @param {Props} props - Component props containing text and additional div element props
 * @param {string} props.text - The text to copy to clipboard
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the root div element
 * @returns {JSX.Element} A styled button div with copy functionality and dynamic icon
 */
const CopyButton = forwardRef<HTMLDivElement, Props>(
  ({ text, ...rest }, ref) => {
    /**
     * State to track whether text has been successfully copied
     * Used to control which icon is displayed
     */
    const [copied, setCopied] = useState(false);

    /**
     * Handler for click events
     * Copies the provided text to clipboard and updates the copied state
     * The state will remain true until the component re-renders
     */
    const onClick = () => {
      navigator.clipboard?.writeText(text).then(() => setCopied(true));
    };

    /**
     * Memoized icon selection based on copy state
     * Returns CheckCircleIcon when copied is true, DocumentDuplicateIcon otherwise
     * Prevents unnecessary re-renders of the icon component
     */
    const Icon = useMemo(
      () => (copied ? CheckCircleIcon : DocumentDuplicateIcon),
      [copied]
    );

    /**
     * Dynamic tooltip text that changes based on copy state
     */
    const title = copied ? "Copied" : "Click to copy to clipboard";

    return (
      <div
        {...rest}
        ref={ref}
        role="button"
        className="w-full sm:w-auto flex-none bg-gray-50 text-gray-400 hover:text-gray-900 font-mono leading-6 py-3 px-2 sm:px-6 border border-gray-200 rounded-xl flex items-center justify-center space-x-2 sm:space-x-4 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-300 focus:outline-none transition-colors duration-200"
        onClick={onClick}
        title={title}
      >
        {/* Text display section with optional dollar sign prefix */}
        <span className="text-gray-900">
          <span className="inline text-gray-500" aria-hidden="true">
            ${" "}
          </span>
          {text}
        </span>

        {/* Screen reader only text for accessibility */}
        <span className="sr-only">(click to copy to clipboard)</span>

        {/* Dynamic icon that changes based on copy state */}
        <div>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    );
  }
);

export default CopyButton;