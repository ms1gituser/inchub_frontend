'use client';

/**
 * src/components/ui/DynamicJsonForm.tsx
 *
 * Schema-driven form component — zero extra UI dependencies.
 * Accepts a DynamicFormSchema JSON object and renders fully
 * validated, accessible form inputs styled for the CRM design system.
 *
 * Supported field types:
 *   text | email | password | phone | url | number |
 *   textarea | select | multiselect | radio | checkbox | date | datetime-local |
 *   divider | heading
 */

import { useState, useId, useMemo } from 'react';
import {
  useForm,
  Controller,
  type RegisterOptions,
  type FieldError,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form';
import type {
  DynamicFormSchema,
  FieldSchema,
  FormSection,
  FormValues,
  FieldValidation,
  TextField,
  NumberField,
  TextareaField,
  SelectField,
  MultiselectField,
  RadioField,
  CheckboxField,
  DateField,
  HeadingField,
} from '@/types/formSchema';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DynamicJsonFormProps {
  schema: DynamicFormSchema;
  onSubmit: (values: FormValues) => void | Promise<void>;
  onCancel?: () => void;
  /** Controlled loading state (disables all inputs + shows spinner in button) */
  isLoading?: boolean;
  /** Pre-fill specific fields */
  defaultValues?: Partial<FormValues>;
  /** Show a success confirmation inside the form after submit */
  successMessage?: string;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const LABEL_CLS =
  'block text-sm font-semibold text-slate-700 mb-1.5';

const INPUT_BASE =
  'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 outline-none transition-all duration-150 ' +
  'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed';

const INPUT_NORMAL =
  'border-slate-200 bg-white ' +
  'hover:border-slate-300 ' +
  'focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 focus:bg-white';

const INPUT_ERROR =
  'border-red-400 bg-red-50/40 ' +
  'focus:border-red-500 focus:ring-3 focus:ring-red-500/10';

const DESCRIPTION_CLS = 'mt-1.5 text-xs text-slate-500 leading-relaxed';
const ERROR_CLS = 'mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a FieldValidation object into react-hook-form RegisterOptions.
 * The `pattern` is stored as a plain string in the JSON schema and
 * converted to a RegExp here at runtime.
 */
function buildRules(validation?: FieldValidation): RegisterOptions {
  if (!validation) return {};
  const rules: RegisterOptions = {};

  if (validation.required !== undefined) {
    rules.required =
      validation.required === true ? 'This field is required.' : validation.required;
  }
  if (validation.minLength !== undefined) {
    rules.minLength =
      typeof validation.minLength === 'number'
        ? { value: validation.minLength, message: `Minimum ${validation.minLength} characters.` }
        : validation.minLength;
  }
  if (validation.maxLength !== undefined) {
    rules.maxLength =
      typeof validation.maxLength === 'number'
        ? { value: validation.maxLength, message: `Maximum ${validation.maxLength} characters.` }
        : validation.maxLength;
  }
  if (validation.min !== undefined) {
    rules.min =
      typeof validation.min === 'number'
        ? { value: validation.min, message: `Minimum value is ${validation.min}.` }
        : validation.min;
  }
  if (validation.max !== undefined) {
    rules.max =
      typeof validation.max === 'number'
        ? { value: validation.max, message: `Maximum value is ${validation.max}.` }
        : validation.max;
  }
  if (validation.pattern) {
    rules.pattern = {
      value: new RegExp(validation.pattern.value, validation.pattern.flags),
      message: validation.pattern.message,
    };
  }

  return rules;
}

/** Determine Tailwind col-span class from field width */
function colSpanClass(width?: string): string {
  if (width === 'half')  return 'col-span-1';
  if (width === 'third') return 'col-span-1 lg:col-span-1';
  return 'col-span-full';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldErrorMsg({ error }: { error?: FieldError }) {
  if (!error) return null;
  return (
    <p className={ERROR_CLS} role="alert">
      {/* Warning icon */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" className="shrink-0">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {error.message as string}
    </p>
  );
}

function FieldDescription({ text }: { text?: string }) {
  if (!text) return null;
  return <p className={DESCRIPTION_CLS}>{text}</p>;
}

// ── Text / Email / Password / Phone / URL ──────────────────────────────────

function TextInput({
  field, register, errors, disabled,
}: {
  field: TextField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  const inputCls = `${INPUT_BASE} ${error ? INPUT_ERROR : INPUT_NORMAL} ${field.prefix || field.suffix ? '' : ''}`;
  const inputType = field.type === 'phone' ? 'tel' : field.type;

  return (
    <div className={colSpanClass(field.width)}>
      <label htmlFor={field.name} className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {(field.prefix || field.suffix) ? (
        <div className="flex rounded-lg overflow-hidden border border-slate-200 focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all duration-150"
          style={{ borderColor: error ? '#f87171' : undefined }}>
          {field.prefix && (
            <span className="inline-flex items-center px-3.5 bg-slate-50 text-slate-500 text-sm font-medium border-r border-slate-200 select-none">
              {field.prefix}
            </span>
          )}
          <input
            id={field.name}
            type={inputType}
            placeholder={field.placeholder}
            disabled={disabled || field.disabled}
            className={`flex-1 px-3.5 py-2.5 text-sm text-slate-900 outline-none bg-white placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400`}
            {...register(field.name, buildRules(field.validation))}
          />
          {field.suffix && (
            <span className="inline-flex items-center px-3.5 bg-slate-50 text-slate-500 text-sm font-medium border-l border-slate-200 select-none">
              {field.suffix}
            </span>
          )}
        </div>
      ) : (
        <input
          id={field.name}
          type={inputType}
          placeholder={field.placeholder}
          disabled={disabled || field.disabled}
          className={inputCls}
          {...register(field.name, buildRules(field.validation))}
        />
      )}

      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Number ────────────────────────────────────────────────────────────────────

function NumberInput({
  field, register, errors, disabled,
}: {
  field: NumberField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  return (
    <div className={colSpanClass(field.width)}>
      <label htmlFor={field.name} className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={field.name}
        type="number"
        step={field.step}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        className={`${INPUT_BASE} ${error ? INPUT_ERROR : INPUT_NORMAL}`}
        {...register(field.name, {
          ...buildRules(field.validation),
          valueAsNumber: true,
        } as RegisterOptions<FormValues>)}
      />
      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

function TextareaInput({
  field, register, errors, disabled,
}: {
  field: TextareaField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  return (
    <div className={colSpanClass(field.width)}>
      <label htmlFor={field.name} className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        id={field.name}
        rows={field.rows ?? 4}
        placeholder={field.placeholder}
        disabled={disabled || field.disabled}
        className={`${INPUT_BASE} ${error ? INPUT_ERROR : INPUT_NORMAL} resize-y min-h-[80px]`}
        {...register(field.name, buildRules(field.validation))}
      />
      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

function SelectInput({
  field, register, errors, disabled,
}: {
  field: SelectField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  return (
    <div className={colSpanClass(field.width)}>
      <label htmlFor={field.name} className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          id={field.name}
          disabled={disabled || field.disabled}
          className={`${INPUT_BASE} ${error ? INPUT_ERROR : INPUT_NORMAL} appearance-none pr-10 cursor-pointer`}
          {...register(field.name, buildRules(field.validation))}
        >
          <option value="">{field.placeholder ?? `Select ${field.label}…`}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Multiselect (native <select multiple>) ─────────────────────────────────

function MultiselectInput({
  field, control, errors, disabled,
}: {
  field: MultiselectField;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  return (
    <div className={colSpanClass(field.width)}>
      <label className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Controller
        name={field.name}
        control={control}
        defaultValue={[]}
        rules={buildRules(field.validation)}
        render={({ field: ctrl }) => {
          const selected: string[] = Array.isArray(ctrl.value)
            ? (ctrl.value as string[])
            : [];
          const toggle = (val: string) => {
            const next = selected.includes(val)
              ? selected.filter((v) => v !== val)
              : [...selected, val];
            ctrl.onChange(next);
          };
          return (
            <div className={`rounded-lg border p-1 ${error ? 'border-red-400 bg-red-50/40' : 'border-slate-200 bg-white'}`}>
              {field.options.map((opt) => {
                const val = String(opt.value);
                const isSelected = selected.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={disabled || field.disabled || opt.disabled}
                    onClick={() => toggle(val)}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-100',
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                    ].join(' ')}
                  >
                    <span className={[
                      'w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0',
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300',
                    ].join(' ')}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
      {field.options.length > 0 && (
        <p className={DESCRIPTION_CLS}>Hold Ctrl / ⌘ to select multiple</p>
      )}
      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Radio ─────────────────────────────────────────────────────────────────────

function RadioInput({
  field, register, errors, disabled,
}: {
  field: RadioField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  const baseId = useId();
  const isHorizontal = field.layout === 'horizontal';
  const isCards = field.layout === 'cards';

  return (
    <div className={colSpanClass(field.width)}>
      <p className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      <div className={isCards
        ? 'grid grid-cols-2 gap-2'
        : `flex ${isHorizontal ? 'flex-row flex-wrap gap-x-6 gap-y-2' : 'flex-col gap-2'}`}
        role="radiogroup"
        aria-label={field.label}
      >
        {field.options.map((opt) => {
          const id = `${baseId}-${opt.value}`;
          return isCards ? (
            <label
              key={opt.value}
              htmlFor={id}
              className="relative flex cursor-pointer rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50/30 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:ring-1 has-[:checked]:ring-blue-500/30"
            >
              <input
                id={id}
                type="radio"
                value={opt.value}
                disabled={disabled || field.disabled || opt.disabled}
                className="sr-only"
                {...register(field.name, buildRules(field.validation))}
              />
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 hidden [input:checked~*_&]:block" />
                </span>
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
              </div>
            </label>
          ) : (
            <label
              key={opt.value}
              htmlFor={id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                id={id}
                type="radio"
                value={opt.value}
                disabled={disabled || field.disabled || opt.disabled}
                className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
                {...register(field.name, buildRules(field.validation))}
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 select-none">
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────

function CheckboxInput({
  field, register, errors, disabled,
}: {
  field: CheckboxField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  return (
    <div className={colSpanClass(field.width)}>
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <input
          id={field.name}
          type="checkbox"
          disabled={disabled || field.disabled}
          className="mt-0.5 w-4 h-4 rounded accent-blue-600 cursor-pointer shrink-0 disabled:cursor-not-allowed"
          {...register(field.name, buildRules(field.validation))}
        />
        <div>
          <span className="block text-sm font-medium text-slate-700 group-hover:text-slate-900 leading-tight">
            {field.checkboxLabel ?? field.label}
            {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
          <FieldDescription text={field.description} />
        </div>
      </label>
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ── Date / DateTime ───────────────────────────────────────────────────────────

function DateInput({
  field, register, errors, disabled,
}: {
  field: DateField;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  const error = errors[field.name] as FieldError | undefined;
  return (
    <div className={colSpanClass(field.width)}>
      <label htmlFor={field.name} className={LABEL_CLS}>
        {field.label}
        {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={field.name}
        type={field.type}
        min={field.min}
        max={field.max}
        disabled={disabled || field.disabled}
        className={`${INPUT_BASE} ${error ? INPUT_ERROR : INPUT_NORMAL} cursor-pointer`}
        {...register(field.name, buildRules(field.validation))}
      />
      <FieldDescription text={field.description} />
      <FieldErrorMsg error={error} />
    </div>
  );
}

// ─── Field router ─────────────────────────────────────────────────────────────

function FieldRenderer({
  field,
  register,
  control,
  errors,
  disabled,
}: {
  field: FieldSchema;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
}) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'phone':
    case 'url':
      return (
        <TextInput
          field={field as TextField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'number':
      return (
        <NumberInput
          field={field as NumberField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'textarea':
      return (
        <TextareaInput
          field={field as TextareaField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'select':
      return (
        <SelectInput
          field={field as SelectField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'multiselect':
      return (
        <MultiselectInput
          field={field as MultiselectField}
          control={control}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <RadioInput
          field={field as RadioField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'checkbox':
      return (
        <CheckboxInput
          field={field as CheckboxField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'date':
    case 'datetime-local':
      return (
        <DateInput
          field={field as DateField}
          register={register}
          errors={errors}
          disabled={disabled}
        />
      );

    case 'divider':
      return (
        <div className="col-span-full">
          <hr className="border-slate-200" />
        </div>
      );

    case 'heading': {
      const h = field as HeadingField;
      const level = h.level ?? 3;
      const tagMap: Record<number, keyof React.JSX.IntrinsicElements> = { 2: 'h2', 3: 'h3', 4: 'h4' };
      const Tag = tagMap[level] ?? 'h3';
      return (
        <div className="col-span-full">
          <Tag className={`font-semibold text-slate-800 ${level === 2 ? 'text-lg' : level === 4 ? 'text-sm' : 'text-base'}`}>
            {h.label}
          </Tag>
          {h.description && <p className="text-sm text-slate-500 mt-0.5">{h.description}</p>}
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  section,
  register,
  control,
  errors,
  disabled,
  twoColumn,
}: {
  section: FormSection;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  disabled?: boolean;
  twoColumn: boolean;
}) {
  const [collapsed, setCollapsed] = useState(section.collapsible ?? false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {(section.title || section.collapsible) && (
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${section.collapsible ? 'cursor-pointer select-none hover:bg-slate-50/60' : ''}`}
          onClick={section.collapsible ? () => setCollapsed((c) => !c) : undefined}
        >
          <div>
            {section.title && (
              <h3 className="text-base font-semibold text-slate-800">{section.title}</h3>
            )}
            {section.description && !collapsed && (
              <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
            )}
          </div>
          {section.collapsible && (
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`text-slate-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      )}

      {!collapsed && (
        <div className={`p-6 grid gap-5 ${twoColumn ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {section.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              register={register}
              control={control}
              errors={errors}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DynamicJsonForm({
  schema,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  successMessage,
}: DynamicJsonFormProps) {
  const [submitted, setSubmitted] = useState(false);

  // Build default values from schema + override with caller defaults
  const schemaDefaults = useMemo(() => {
    const defaults: Partial<FormValues> = {};
    const fields = schema.fields
      ? schema.fields
      : (schema.sections ?? []).flatMap((s) => s.fields);

    for (const f of fields) {
      if ('defaultValue' in f && f.defaultValue !== undefined) {
        defaults[f.name] = f.defaultValue as FormValues[string];
      }
    }
    return defaults;
  }, [schema]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: useMemo(() => ({ ...schemaDefaults, ...defaultValues }), [schemaDefaults, defaultValues]),
    mode: 'onTouched', // validate on first blur, then on every change
  });

  const isDisabled = isLoading || isSubmitting;
  const twoColumn = schema.layout === 'two-column';

  const sections: FormSection[] = useMemo(() => {
    return schema.sections
      ? schema.sections
      : schema.fields
      ? [{ fields: schema.fields }]
      : [];
  }, [schema]);

  async function handleFormSubmit(values: FormValues) {
    await onSubmit(values);
    if (successMessage) {
      setSubmitted(true);
      reset();
    }
  }

  // ── Success state ──
  if (submitted && successMessage) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-emerald-800 mb-1">{successMessage}</h3>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      aria-label={schema.title ?? 'Form'}
    >
      {/* Form header */}
      {(schema.title || schema.description) && (
        <div className="mb-6">
          {schema.title && (
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{schema.title}</h2>
          )}
          {schema.description && (
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{schema.description}</p>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="flex flex-col gap-5">
        {sections.map((section, idx) => (
          <SectionCard
            key={idx}
            section={section}
            register={register}
            control={control}
            errors={errors}
            disabled={isDisabled}
            twoColumn={twoColumn}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {schema.cancelLabel ?? 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-semibold text-white shadow-sm hover:from-blue-600 hover:to-blue-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-3 focus:ring-blue-500/30"
        >
          {isDisabled ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Processing…
            </>
          ) : (
            schema.submitLabel ?? 'Submit'
          )}
        </button>
      </div>
    </form>
  );
}
