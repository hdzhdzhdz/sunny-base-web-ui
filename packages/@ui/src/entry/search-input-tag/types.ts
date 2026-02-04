export interface FieldNames {
  label?: string;
  value?: string;
}

export interface SearchInputTagProps {
  modelValue?: any[];
  fieldNames?: FieldNames;
  placeholder?: string;
  disabled?: boolean;
  maxTagCount?: number;
}
