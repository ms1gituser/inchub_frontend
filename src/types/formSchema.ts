/**
 * src/types/formSchema.ts
 *
 * Fully-serialisable JSON Schema types for DynamicJsonForm.
 * Every value in this file must be JSON-safe (no RegExp, no functions).
 */

// ─── Primitive field types ────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'phone'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime-local'
  | 'divider'
  | 'heading';

export type FieldWidth = 'full' | 'half' | 'third';

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * All validation rules must be JSON-serialisable.
 * `pattern` is stored as a plain string and converted to RegExp at runtime.
 */
export interface FieldValidation {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  /** Regular-expression string (e.g. "^[A-Z].*") with optional flags ("gi") */
  pattern?: { value: string; flags?: string; message: string };
}

// ─── Select option ────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// ─── Field discriminated union ────────────────────────────────────────────────

interface BaseField {
  /** Unique key used as the form field name */
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  /** Default value — must match the field's value type */
  defaultValue?: string | number | boolean | string[];
  validation?: FieldValidation;
  /** Grid column width */
  width?: FieldWidth;
}

export interface TextField extends BaseField {
  type: 'text' | 'email' | 'password' | 'phone' | 'url';
  prefix?: string;  // e.g. "+91" for phone, "https://" for url
  suffix?: string;  // e.g. ".com"
}

export interface NumberField extends BaseField {
  type: 'number';
  step?: number;
}

export interface TextareaField extends BaseField {
  type: 'textarea';
  rows?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: SelectOption[];
}

export interface MultiselectField extends BaseField {
  type: 'multiselect';
  options: SelectOption[];
}

export interface RadioField extends BaseField {
  type: 'radio';
  options: SelectOption[];
  /** Visual layout of radio buttons */
  layout?: 'vertical' | 'horizontal' | 'cards';
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  /** Text shown inline next to the checkbox (falls back to label) */
  checkboxLabel?: string;
}

export interface DateField extends BaseField {
  type: 'date' | 'datetime-local';
  min?: string;
  max?: string;
}

/** Non-interactive layout elements */
export interface DividerField {
  type: 'divider';
  name: string;
}

export interface HeadingField {
  type: 'heading';
  name: string;
  label: string;
  level?: 2 | 3 | 4;
  description?: string;
}

export type FieldSchema =
  | TextField
  | NumberField
  | TextareaField
  | SelectField
  | MultiselectField
  | RadioField
  | CheckboxField
  | DateField
  | DividerField
  | HeadingField;

// ─── Section & top-level schema ───────────────────────────────────────────────

export interface FormSection {
  /** Section card title */
  title?: string;
  description?: string;
  fields: FieldSchema[];
  /** Collapse section by default */
  collapsible?: boolean;
}

/**
 * Top-level JSON Schema passed to <DynamicJsonForm />.
 * You can use either:
 *   • `fields`   — flat list (rendered in a single card)
 *   • `sections` — multiple named cards
 */
export interface DynamicFormSchema {
  title?: string;
  description?: string;
  /** Use sections for multi-card layouts */
  sections?: FormSection[];
  /** Use fields for a simple single-card layout */
  fields?: FieldSchema[];
  submitLabel?: string;
  cancelLabel?: string;
  layout?: 'single-column' | 'two-column';
}

// ─── Runtime form value types ─────────────────────────────────────────────────

export type FormValues = Record<string, string | number | boolean | string[] | undefined>;
