declare namespace JSX {
  interface IntrinsicElements {
    "math-field": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        disabled?: string;
        "virtual-keyboard-mode"?: string;
        "smart-fence"?: string;
        "smart-mode"?: string;
        "read-only"?: string;
      },
      HTMLElement
    >;
  }
}

