/**
 * Card Component
 * 
 * A reusable card component that displays featured content with an icon, title, description,
 * and a link to external documentation. The card features a semi-transparent glass-morphism
 * design with an icon watermark in the background.
 * 
 * Commonly used in documentation hubs, feature showcases, or resource directories to present
 * organized information in a visually appealing grid layout.
 * 
 * @component
 * @example
 * // Basic usage with an icon component
 * import { StarIcon } from '@heroicons/react/24/outline';
 * 
 * <Card 
 *   title="React Documentation"
 *   description="Learn the fundamentals and advanced concepts of React"
 *   Icon={StarIcon}
 *   href="https://react.dev"
 * />
 * 
 * @example
 * // With custom attributes
 * <Card 
 *   title="TypeScript Guide"
 *   description="Master TypeScript for type-safe JavaScript development"
 *   Icon={DocumentIcon}
 *   href="https://www.typescriptlang.org/docs"
 *   id="typescript-card"
 *   data-testid="card-typescript"
 * />
 * 
 * @typedef {Object} CardProps
 * @property {string} title - The card heading text displayed prominently in blue
 * @property {string} description - The descriptive text content displayed below the title
 * @property {ForwardRefExoticComponent} Icon - An SVG icon component (e.g., from @heroicons/react)
 *                                               used as a decorative watermark in the background
 * @property {string} href - The URL that the "Visit documentation" link points to
 * @property {...rest} - Additional HTML div attributes (id, data-*, aria-*, etc.)
 *                       Note: className and children are managed internally
 * 
 * @returns {JSX.Element} A styled card div with icon, title, description, and documentation link
 */
import {
  forwardRef,
  ComponentProps,
  RefAttributes,
  ForwardRefExoticComponent,
  SVGProps,
} from "react";

/**
 * Props interface for Card component
 * 
 * Extends standard div element props while removing className and children
 * as these are managed internally by the component.
 * 
 * @interface CardProps
 * @property {string} title - The main heading of the card (required)
 * @property {string} description - The descriptive text content (required)
 * @property {ForwardRefExoticComponent} Icon - A forward-ref SVG icon component from a library
 *                                              like @heroicons/react (required)
 * @property {string} href - The target URL for the documentation link (required)
 * @property {...rest} - Any additional div element attributes (id, data-*, aria-*, etc.)
 */
export interface CardProps
  extends Omit<ComponentProps<"div">, "className" | "children"> {
  title: string;
  description: string;
  Icon: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & RefAttributes<SVGSVGElement>
  >;
  href: string;
}

/**
 * Card - A featured content card with icon, title, description, and documentation link
 * 
 * Displays information in a glass-morphism styled container with:
 * - Semi-transparent white background with opacity effects
 * - Icon watermark in the bottom-right corner (low opacity)
 * - Title in bold blue text at the top
 * - Descriptive text below title that expands to fill available space
 * - "Visit documentation" link at the bottom with hover effect
 * - Full height layout suitable for grid layouts
 * 
 * Design features:
 * - Glass-morphism effect with bg-white/10 and opacity-5
 * - Rounded corners and shadow for depth
 * - Responsive text sizing and spacing
 * - External link opens in new tab (target="_blank")
 * - Icon is hidden from screen readers as it's decorative
 * 
 * @param {CardProps} props - Component props
 * @param {string} props.title - The card heading text
 * @param {string} props.description - The description text content
 * @param {ForwardRefExoticComponent} props.Icon - SVG icon component for the watermark
 * @param {string} props.href - The documentation URL
 * @param {...rest} - Additional div element props
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the root div element
 * @returns {JSX.Element} A styled card container with all content elements
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ title, description, Icon, href, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white/10 bg-opacity-5 rounded-md shadow p-4 relative overflow-hidden h-full"
        {...rest}
      >
        {/* Icon watermark in bottom-right corner */}
        <div>
          <span className="absolute right-3 bottom-3 flex items-center justify-center rounded-md opacity-10">
            <Icon className="h-12 w-12 text-white" aria-hidden="true" />
          </span>
        </div>

        {/* Main content container with flexbox column layout */}
        <div className="flex flex-col h-full">
          {/* Card title - bold blue heading */}
          <h3 className="text-2xl font-bold text-blue-500">
            {title}
          </h3>

          {/* Card description - expands to fill available space */}
          <p className="mt-2 text-base text-gray-300 flex-1">
            {description}
          </p>

          {/* Documentation link at bottom */}
          <div className="pt-6">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-white font-bold transition tracking-wide hover:text-blue-400"
            >
              Visit documentation →
            </a>
          </div>
        </div>
      </div>
    );
  }
);

export default Card;