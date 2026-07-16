'use client';

import React, { CSSProperties, JSX } from 'react';

interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'subtitle' | 'label' | 'caption';
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  weight?: 300 | 400 | 500 | 600;
  align?: 'left' | 'center' | 'right' | 'justify';
  as?: keyof JSX.IntrinsicElements;
  truncate?: boolean;
}

const colorMap = {
  primary: '#1f2937',
  secondary: '#6b7280',
  success: '#16a34a',
  error: '#dc2626',
  warning: '#ea580c',
  info: '#2563eb',
  inherit: 'inherit',
};

const variantStyles: Record<string, CSSProperties> = {
  h1: {
    fontSize: '3rem',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 400,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2.25rem',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  h3: {
    fontSize: '1.875rem',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 500,
    lineHeight: 1.2,
  },
  h4: {
    fontSize: '1.5rem',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 500,
    lineHeight: 1.3,
  },
  h5: {
    fontSize: '1.25rem',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h6: {
    fontSize: '1rem',
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    lineHeight: 1.4,
  },
  body: {
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  subtitle: {
    fontSize: '1.125rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  label: {
    fontSize: '0.75rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    lineHeight: 1.4,
  },
  caption: {
    fontSize: '0.75rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    lineHeight: 1.5,
  },
};

/**
 * Consistent typography component enforcing brand guidelines
 * Supports Cormorant Garamond (headlines) and Inter (body/UI)
 */
export default function Typography({
  variant,
  children,
  className,
  style,
  color = 'primary',
  weight,
  align,
  as,
  truncate,
}: TypographyProps) {
  const component = as || (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant) ? variant : 'p');

  const mergedStyle: CSSProperties = {
    ...variantStyles[variant],
    color: colorMap[color],
    ...(weight && { fontWeight: weight }),
    ...(align && { textAlign: align }),
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    ...style,
  };

  return React.createElement(
    component,
    {
      className,
      style: mergedStyle,
    },
    children
  );
}

/* Preset Components */
export function H1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h1" />;
}

export function H2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h2" />;
}

export function H3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h3" />;
}

export function H4(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h4" />;
}

export function H5(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h5" />;
}

export function H6(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h6" />;
}

export function Body(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="body" />;
}

export function Subtitle(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="subtitle" />;
}

export function Label(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="label" />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="caption" />;
}
